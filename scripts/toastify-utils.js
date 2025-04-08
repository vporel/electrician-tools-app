
const ToastifyUtils = {
    success: (text, options) => {
        Toastify({
            text,
            duration: 3000,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            style: {
              background: "#28a745"
            },
            ...options
        }).showToast();
    },
    warning: (text, options) => {
        Toastify({
            text,
            duration: 3000,
            close: true,
            gravity: "bottom", 
            position: "right",
            style: {
              background: "#ffc107"
            },
            ...options
        }).showToast();
    },
    error: (text, options) => {
        Toastify({
            text,
            duration: 3000,
            close: true,
            gravity: "bottom", 
            position: "right",
            style: {
              background: "#dc3545"
            },
            ...options
        }).showToast();
    }
}