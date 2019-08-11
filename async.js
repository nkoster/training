async function f(t) {
    return await new Promise(yes => {
        setTimeout(() => yes('hello world'), t)
    })
}

f(5000).then(d => console.log(d), e => console.error(e))
