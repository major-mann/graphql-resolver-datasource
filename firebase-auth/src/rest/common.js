module.exports = {
    post
};

const fetch = require(`node-fetch`);

async function post(uri, data, headers) {
    const response = await fetch(uri, {
        method: `POST`,
        headers: {
            ...headers,
            'content-type': `application/json`
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        const body = await response.json();
        return body;
    }

    // All the rest is for error handling
    if (!isJson(response.headers.get(`content-type`))) {
        const err = new Error(await response.text());
        err.code = response.status;
        throw err;
    }

    // Standard error format
    const body = await response.json();
    if (!body || !body.error) {
        throw new Error(`An unknow error occured while posting to "${uri}". ${JSON.stringify(body)}`);
    }

    const err = new Error(`An error occured with firebase auth rest API at endpoint "${uri}"`);
    err.code = body.error.message;
    err.errors = body.errors;
    throw err;
}

function isJson(contentType) {
    if (contentType) {
        const [type] = contentType.split(`;`);
        return type && type.trim() === `application/json`;
    } else {
        return false;
    }
}