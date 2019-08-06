async function f() {
    return await new Promise((_, no) => {
        setTimeout(() => no(new Error('oops')), 2000)
    })
}

f().catch(err => console.log('bla: ', err))
