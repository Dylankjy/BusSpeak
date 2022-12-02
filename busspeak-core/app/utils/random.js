const uuid = require('uuid')
const sha512 = require('hash-anything').sha512


const random = () => {
    return sha512({
        a: `${uuid.v5(uuid.v4(), uuid.v5(uuid.v4(), uuid.v4()))}${uuid.v5(uuid.v4(), uuid.v5(uuid.v4(), uuid.v4()))}${uuid.v5(uuid.v4(), uuid.v5(uuid.v4(), uuid.v4()))}`,
        b: uuid.v4() + uuid.v4() + (new Date())
    })
}

module.exports = {
    random
}
