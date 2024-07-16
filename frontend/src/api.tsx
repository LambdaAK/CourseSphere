
const usersCreate = async (email: string, password: string) => {
  
  const response = await fetch('http://127.0.0.1:5000/users/create', {
    method: 'POST',
    mode: "cors",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email, password})
  })
  const json = await response.json()
  return json
}

export {
  usersCreate
}