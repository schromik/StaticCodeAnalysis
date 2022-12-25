module.exports = {
    meta: {
        messages: {
            emptyCatch: 'Leeren catch block gefunden! ',
        },
    },
    create(context) {
        return {
            CatchClause(node) {
                if (node.body.body.length === 0) {
                    context.report({ node: node.body, messageId: 'emptyCatch' });
                }
            }
        }
    }
};