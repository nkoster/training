function yesno() {
    return new Promise((yes, no) => {
        const val = Math.round(Math.random() * 1)
        val ? yes('Yes') : no('No')
    })
}

yesno().then(d => console.log(d), e => console.error(e))
