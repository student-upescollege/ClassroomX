"use client";
import {
  createContext,
  useState,
  useContext,
  SetStateAction,
  Dispatch,
} from "react";

interface IUser {
  createdAt?: string;
  email?: string;
  employeeID?: null;
  firstName?: string;
  lastName?: string;
  updatedAt?: string;
  sap?: number;
}

interface IUserContext {
  user: IUser;
  setUser: Dispatch<SetStateAction<IUser>>;
}

const AuthContext = createContext<IUserContext>({
  user: {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser>({});

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
