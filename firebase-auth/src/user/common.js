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
    if (user) {
        return {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            disabled: user.disabled,
            customClaims: user.customClaims,
            passwordHash: user.passwordHash,
            passwordSalt: user.passwordSalt
        };
    } else {
        return user;
    }
}
