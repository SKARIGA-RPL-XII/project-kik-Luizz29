import * as Yup from "yup";

export const schema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Email tidak valid")
    .required("Email wajib diisi"),
  password: Yup.string()
    .trim()
    .required("Password wajib diisi"),
});
