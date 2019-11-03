module.exports = {
    copyUser,
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

function copyUser(user) {
    if (user && typeof user.toJSON === `function`) {
        return user.toJSON();
    } else {
        return user;
    }
}
