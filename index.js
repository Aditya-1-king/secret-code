const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const { sendLoginNotification, sendMessage } = require("./utils/sendmail.js");
 // gets current deployed domain



app.listen(port, () => console.log("Server is listening on port", port));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "this is secret",
}));
app.use(flash());

// Store pending login requests
let pendingLogins = {};

// Cleanup old pending requests
const PENDING_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const PENDING_EXPIRY = 15 * 60 * 1000; // 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [requestId, login] of Object.entries(pendingLogins)) {
        if (now - new Date(login.timestamp).getTime() > PENDING_EXPIRY) {
            console.log(`Cleaning up expired request: ${requestId}`);
            delete pendingLogins[requestId];
        }
    }
}, PENDING_CLEANUP_INTERVAL);

// Home page
app.get("/", (req, res) => {
    res.render("home", { error: req.flash("error") });
});

// Check password
app.post("/check-password", async (req, res) => {
    const { password } = req.body;

    const hashedPassword = "$2b$10$M0zv09bQM6VjLCAK2UCBnesMr96zLtylIM9QQPv1Hd27UUHwqr/li"; // Example bcrypt hash
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        if (!match) {
            req.flash("error", "Incorrect password, please try again.");
            return res.redirect("/");
        }

        // Password correct, create pending request
        const requestId = Date.now().toString();
        pendingLogins[requestId] = {
            status: "pending",
            timestamp: new Date(),
            sessionID: req.sessionID
        };

        // Send notification to owner
        await sendLoginNotification(req.ip, requestId);

        // Redirect to waiting page
        res.redirect(`/waiting/${requestId}`);

    } catch (err) {
        console.error(err);
        req.flash("error", "An error occurred. Please try again.");
        res.redirect("/");
    }
});

// Waiting page
app.get("/waiting/:requestId", (req, res) => {
    // const host = req.get('host');
    req.session.user == true
    const { requestId } = req.params;
    if (!pendingLogins[requestId]) {
        req.flash("error", "Invalid or expired request.");
        return res.redirect("/");
    }
  res.render("waiting", { requestId });
});

// Polling approval status
app.get("/check-approval/:requestId", (req, res) => {
    const { requestId } = req.params;
    if (!pendingLogins[requestId]) return res.json({ status: "expired" });

    return res.json({ status: pendingLogins[requestId].status });
});
// Deny login request
app.get("/deny/:requestId", (req, res) => {
    const { requestId } = req.params;
    const loginRequest = pendingLogins[requestId];
    if (!loginRequest) return res.json({ success: false });

    loginRequest.status = "denied"; // mark as denied

    // Optionally, you can clear the session or notify the user
    const sessionStore = req.sessionStore;
    sessionStore.get(loginRequest.sessionID, (err, sessionData) => {
        if (!err && sessionData) {
            sessionData.user = false; // ensure user is not logged in
            sessionStore.set(loginRequest.sessionID, sessionData, () => {});
        }
    });

    return res.json({ success: true ,message : " User has been denied" });
});

// Owner approves a request
app.get("/approve/:requestId", (req, res) => {
    const { requestId } = req.params;
    const loginRequest = pendingLogins[requestId];
    if (!loginRequest) return res.json({ success: false });

    loginRequest.status = "approved";

    // Set session for the user
    const sessionStore = req.sessionStore;
    sessionStore.get(loginRequest.sessionID, (err, sessionData) => {
        if (!err && sessionData) {
            sessionData.user = true; // mark as logged in
            sessionStore.set(loginRequest.sessionID, sessionData, () => {});
        }
    });

    return res.json({ success: true,message : " User has been approved"  });
});

// Secret message page
app.get("/secret-message", (req, res) => {
    if (req.session.user === true) {
        res.render("secret", { success: req.flash("success") });
    } else {
        req.flash("error", "You should log in first.");
        res.redirect("/");
    }
});

// Feedback form submission
app.post("/user/message", async (req, res) => {
    const { email, message } = req.body;
    await sendMessage(message, email);
    req.flash("success", "Your message was sent to the developer");
    res.redirect("/secret-message");
});
