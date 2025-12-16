import { useState } from "react"
import { Title } from "../../shared/title"
import { Button } from "../../shared/button"
import { Field } from "../../shared/field"

export const Login = () => {
    const [number, setNumber] = useState('')
    const [password, setPassword] = useState('')

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNumber(e.target.value)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(number, password)
    }

    return (
        <>
            <Title level={2}>Login</Title>
            <form onSubmit={handleSubmit}>
                <Field label="Номер" type="number" id="number" value={number} onChange={handleNumberChange} />
                <Field label="Пароль" type="password" id="password" value={password} onChange={handlePasswordChange} />
                <Button type="submit">Войти</Button>
            </form>
        </>
    )
}