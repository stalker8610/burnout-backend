export const errorMessage = (e) => {
    return typeof e === 'string' ? e : e.message;
}