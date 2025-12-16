import { useState } from "react"
import { Button } from "../../shared/button"
import { Field } from "../../shared/field"
import { Title } from "../../shared/title"

export const Register = () => {
    const [name, setName] = useState('')
    const [number, setNumber] = useState('')
    const [password, setPassword] = useState('')

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNumber(e.target.value)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(name, number, password)
    }

    return (
        <>
            <Title level={2}>Register</Title>
            <form onSubmit={handleSubmit}>
                <Field label="Имя" type="text" id="name" value={name} onChange={handleNameChange} />
                <Field label="Номер" type="number" id="number" value={number} onChange={handleNumberChange} />
                <Field label="Пароль" type="password" id="password" value={password} onChange={handlePasswordChange} />
                <Button type="submit">Зарегистрироваться</Button>
            </form>
        </>
    )
}