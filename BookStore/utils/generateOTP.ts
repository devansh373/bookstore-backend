function generateOtp(length: number = 6): string {
    return Math.floor(100000 + Math.random() * 900000)
        .toString()
        .slice(0, length);
}

export default generateOtp;
