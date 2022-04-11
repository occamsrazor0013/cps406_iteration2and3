import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, db, logout } from "./firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import {
    Input,
    Box,
    Button,
    Center,
    HStack
  } from '@chakra-ui/react'
import "./styles.css";

function Dashboard() {
    const [user, loading, error] = useAuthState(auth);
    const [name, setName] = useState("");
    const navigate = useNavigate();
    const fetchUserName = async () => {
        try {
        const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        const doc = await getDocs(q);
        const data = doc.docs[0].data();
        setName(data.name);
        } catch (err) {
        console.error(err);
        alert("An error occured while fetching user data");
        }
    };
    useEffect(() => {
        if (loading) return;
        if (!user) return navigate("/");
        fetchUserName();
    }, [user, loading]);
    const [startDate, setStartDate] = useState(new Date());
    return (
        <Box>
            Logged in as
            <div>{name}</div>
            <div>{user?.email}</div>
            <Center>
                <HStack spacing="24px">
                        <Box>
                            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
                        </Box>
                        <Button>
                            Add
                        </Button>
                </HStack>
            </Center>
            <Button onClick={logout}>
                Logout
            </Button>
        </Box>
    );
}
export default Dashboard;