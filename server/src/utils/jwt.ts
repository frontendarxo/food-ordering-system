const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET не установлен в переменных окружения');
    }
    return secret;
};

export const JWT_SECRET = getJwtSecret();

