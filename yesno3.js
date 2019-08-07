function yesno() {
    return new Promise((yes, no) => {
        const val = Math.round(Math.random() * 1)
        val ? yes('Yes') : no('No')
    })
}

async function msg() {
    try {
        return await yesno()
    } catch (err) {
        return err
    }
}

msg().then(d => console.log(d), e => console.error(e))
