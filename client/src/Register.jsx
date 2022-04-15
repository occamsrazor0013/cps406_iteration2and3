import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import {
    auth,
    registerWithEmailAndPassword,
    signInWithGoogle,
} from "./firebase";
import { FcGoogle } from 'react-icons/fc'
import {
    Box,
    Button,
    Center,
    Checkbox,
    Container,
    Divider,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Stack,
    Text,
    useBreakpointValue,
    useColorModeValue,
    ButtonGroup,
    RadioGroup,
    Radio,
  } from '@chakra-ui/react'
function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [level, setLevel] = useState("member");
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();
    const register = () => {
        if (!name) alert("Please enter name");
        registerWithEmailAndPassword(name, email, password, phone, address, level);
    };
    useEffect(() => {
        if (loading) return;
        if (user) navigate("/dashboard");
    }, [user, loading, navigate]);
    return (
        <Container
            maxW='lg'
            py={{ base: '12', md: '24' }}
            px={{ base: '0', sm: '8' }}>

        <Stack spacing='8'
          boxShadow="lg"
          rounded="xl"
          flexDir="column"
          justifyContent="center">
          
            <Stack spacing='6'>
                <Stack spacing={{ base: '2', md: '3' }} textAlign='center'>
                <Heading color='gray.700' marginTop='2rem' marginBottom='-1rem'>
                    Register now.
                </Heading>
                </Stack>
            </Stack>
            <Box
            minW={{ base: "90%", md: "50px" }}
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={useBreakpointValue({ base: 'transparent', sm: 'bg-surface' })}
            boxShadow={{ base: 'none', sm: useColorModeValue('md', 'md-dark') }}
            borderRadius={{ base: 'none', sm: 'xl' }}
            >
            <Stack spacing='7'>
                <Stack spacing='7'>
                    <FormControl>
                    <FormLabel htmlFor='name'>Name</FormLabel>
                    <Input
                        id='name'
                        type='text'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder='Full Name'
                    />
                    <FormLabel htmlFor='email'>Email</FormLabel>
                    <Input
                        id='email'
                        type='text'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder='E-mail Address'
                    />
                    <FormLabel htmlFor='email'>Phone Number</FormLabel>
                    <Input
                        id='phone'
                        type='text'
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder='Phone'
                    />
                    <FormLabel htmlFor='address'>Address</FormLabel>
                    <Input
                        id='address'
                        type='text'
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder='Address'
                    />
                    <FormLabel htmlFor='password'>Password</FormLabel>
                    <Input
                        id='password'
                        type='password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder='Password'
                    />
                    </FormControl>
                    <Center>
                        <RadioGroup onChange={setLevel} value={level}>
                        <Stack direction='row'>
                            <Radio value='member'>Member</Radio>
                            <Radio value='treasurer'>Treasurer</Radio>
                            <Radio value='coach'>Coach</Radio>
                        </Stack>
                        </RadioGroup>
                    </Center>
                </Stack>
                <Stack spacing='6'>
                    <Button
                        borderRadius={5}
                        type="submit"
                        variant="solid"
                        colorScheme="blue"
                        width="inherit"
                        onClick={register}
                        fontSize="sm">
                        Register
                    </Button>
                    <Center>
                        <Box>
                            Already have an account?{" "}
                            <Button variant='link' colorScheme='blue'>
                            <Link to='/'>Sign In</Link>
                            </Button>
                        </Box>
                    </Center>
                <HStack>
                    <Divider />
                    <Text fontSize="sm" whiteSpace="nowrap" color="muted">
                        or continue with
                        </Text>
                        <Divider />
                        </HStack>
                        <Center>
                        <FcGoogle size={40} onClick={signInWithGoogle}/>
                </Center>
              </Stack>
                </Stack>
            </Box>
            </Stack>
        </Container>
    );
}
export default Register;