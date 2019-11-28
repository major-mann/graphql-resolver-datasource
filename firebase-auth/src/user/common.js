module.exports = {
    sanitizeUserInput,
    shouldCallUpsert,
    plainUserObject
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

function plainUserObject(user) {
    if (user && typeof user.toJSON === `function`) {
        return user.toJSON();
    } else {
        return user;
    }
}

function sanitizeUserInput(user) {
    user = { ...user };
    delete user.tenantId;
    return user;
}
