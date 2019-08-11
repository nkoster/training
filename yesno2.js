function yesno() {
    return new Promise((yes, no) => {
        const val = Math.round(Math.random() * 1)
        val ? yes('Yes') : no('No')
    })
}

async function msg() {
    try {
        const msg = await yesno()
        console.log(msg)
    } catch (err) {
        console.error(err)
    }
}

msg()
