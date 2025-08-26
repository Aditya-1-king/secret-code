const bcrypt = require('bcrypt');
async function hashPassword(password, saltRounds = 10) {
    try {
        const hashed = await bcrypt.hash(password, saltRounds);
        return hashed;
    } catch (err) {
        console.error("Error hashing password:", err);
        throw err;
    }
}

// Example usage:
(async () => {
    const plainPassword = "TONY STARK";
    const hashedPassword = await hashPassword(plainPassword);
    console.log("Hashed password:", hashedPassword);
})();

module.exports = hashPassword