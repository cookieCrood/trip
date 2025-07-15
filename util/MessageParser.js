

class MessageParser {
    static parse(message, data, flags = {
        user:false
    }) {
        if (flags.user) {
            message = message.replaceAll('{user}', `<@${data.userId}>`)
        }
        return message
    }
}

module.exports = MessageParser