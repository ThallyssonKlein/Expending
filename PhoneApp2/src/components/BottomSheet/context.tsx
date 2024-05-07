import React from "react";

interface IProps {
    children: React.ReactNode[];
}

const MyContext = React.createContext(null);

export default function Context({ children }: IProps) {
    return (
        <MyContext.Provider value={null}>
            {children}
        </MyContext.Provider>
    )
}