export const errorMessage = (e) => {
    return typeof e === 'string' ? e : e.message;
}

export const generateDateBoundaries = (limit: number) => {

    let currentDate = new Date();
    const boundaries = [new Date(currentDate)]

    // search for first monday
    while (currentDate.getDay() !== 1) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    boundaries.unshift(new Date(currentDate.setHours(0, 0, 0, 0)));

    // then count weeks before
    for (let i = 0; i < limit; i++) {
        currentDate.setDate(currentDate.getDate() - 7);
        boundaries.unshift(new Date(currentDate));
    }

    return boundaries;

}