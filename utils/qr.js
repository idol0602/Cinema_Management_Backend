import QRCode from "qrcode";

export const generateQrCode = (token) => {
    return QRCode.toDataURL(token, {
        type: "png",
        color: {
            dark: "#000000",
            light: "#ffffff",
        },
        errorCorrectionLevel: "H",
        with: 300,
        margin: 2,
    });
}