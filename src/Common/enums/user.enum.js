export const GenderEnum = {
    MALE : "male",
    FEMALE : "female"
}


export const RoleEnum = {
    USER : "user",
    ADMIN : "admin",
    SUPER_ADMIN : "super_admin"
}

export const PrivillageEnum = {
    SUPER_ADMIN : [RoleEnum.SUPER_ADMIN],
    ADMIN : [RoleEnum.ADMIN],
    USER : [RoleEnum.USER],
    ALL : [RoleEnum.ADMIN , RoleEnum.SUPER_ADMIN , RoleEnum.USER],
    ADMINS : [RoleEnum.ADMIN , RoleEnum.SUPER_ADMIN],
    USER_ADMIN : [RoleEnum.USER , RoleEnum.ADMIN],
    USER_SUPER_ADMIN : [RoleEnum.USER , RoleEnum.SUPER_ADMIN]
}

export const ProviderEnum = {
    LOCAL : "local",
    GOOGLE : "google",
    FACEBOOK : "facebook"
}