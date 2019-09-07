module.exports = {
    shouldCallUpsert
};

const FIREBASE_PASSWORD_LIMIT = 6;

function shouldCallUpsert(input) {
    if (input.password) {
        return String(input.password).length < FIREBASE_PASSWORD_LIMIT;
    } else if (input.passwordHash) {
        return true;
    } else {
        return false;
    }
}
