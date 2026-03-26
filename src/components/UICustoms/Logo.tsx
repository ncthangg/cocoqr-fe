const Logo = ({ className = "h-9 w-9" }) => {
    return (
        <>
            <img
                src="/qr-code-dark.svg"
                alt="CocoQR"
                className={`${className} dark:hidden`}
            />
            <img
                src="/qr-code-light.svg"
                alt="CocoQR"
                className={`${className} hidden dark:block`}
            />
        </>
    );
};

export default Logo;