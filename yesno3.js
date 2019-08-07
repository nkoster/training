function yesno() {
    return new Promise((yes, no) => {
        const val = Math.round(Math.random() * 1)
        val ? yes('Yes') : no('No')
    })
}

async function msg() {
    let result
    try {
        result = await yesno()
    } catch (err) {
        result = err
    }
    return result
}

msg().then(d => console.log(d), e => console.error(e))
