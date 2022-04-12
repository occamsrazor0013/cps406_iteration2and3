
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, db, logout } from "./firebase";
import { query, collection, getDocs, where, updateDoc, arrayUnion, doc, onSnapshot } from "firebase/firestore";
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
    const [startDate, setStartDate] = useState(new Date());
    const [name, setName] = useState("");
    const [notPaid, setNotPaid] = useState("");
    const navigate = useNavigate();
    const fetchUserName = async () => {
        try {
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const doc = await getDocs(q);
        const data = doc.docs[0].data();
        setNotPaid(data.unpaid)
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

    function MemberDashboard(){
        return(
            <Box />
        )
    }
    function TreasurerDashboard(){
        return(
            <Box />
        )
    }
    function AdminDashboard(){
        return(
            <Box />
        )
    }

    const addPractice = async () => {
        try {
        await updateDoc(doc(db, "users", user.uid), {
            unpaid: arrayUnion(startDate)
        }); } catch (err) {
            alert(err.message);
        }
    };

    return (
        <Box>
            Logged in as
            <Box>
                {name}
            </Box>
            <Center>
                <HStack spacing="24px">
                    <Box>
                        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
                    </Box>
                    <Button onClick={addPractice}>
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
