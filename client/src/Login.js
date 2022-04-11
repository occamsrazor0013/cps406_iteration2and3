import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword, signInWithGoogle } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
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
  } from '@chakra-ui/react'
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();
    useEffect(() => {
        if (loading) {
        // maybe trigger a loading screen
        return;
        }
        if (user) navigate("/dashboard");
    }, [user, loading]);
    return (
        <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
            <Stack spacing="8">
                <Stack spacing="6">
                    <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
                    <Heading size={useBreakpointValue({ base: 'xs', md: 'sm' })}>
                        Log in to your account
                    </Heading>
                    <HStack spacing="1" justify="center">
                        <Text color="muted">Don't have an account?</Text>
                        <Button variant="link" colorScheme="blue">
                            <Link to="/register">Register now</Link>
                        </Button>
                    </HStack>
                    </Stack>
                </Stack>
                <Box
                    py={{ base: '0', sm: '8' }}
                    px={{ base: '4', sm: '10' }}
                    bg={useBreakpointValue({ base: 'transparent', sm: 'bg-surface' })}
                    boxShadow={{ base: 'none', sm: useColorModeValue('md', 'md-dark') }}
                    borderRadius={{ base: 'none', sm: 'xl' }}
                >
                    <Stack spacing="7">
                        <Stack spacing="12">
                            <FormControl>
                                <FormLabel htmlFor="email">Email</FormLabel>
                                <Input 
                                    id="email" 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-mail Address" />
                                <FormLabel htmlFor="email">Password</FormLabel>
                                <Input 
                                    id="password" 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password" />
                            </FormControl>
                        </Stack>
                        <HStack justify="space-between">
                            <Checkbox defaultIsChecked>Remember me</Checkbox>
                            <Button variant="link" colorScheme="blue" size="sm">
                                <Link to="/reset">Forgot Password</Link>
                            </Button>
                        </HStack>
                        <Stack spacing="6">
                            <Button colorScheme='blue' onClick={() => logInWithEmailAndPassword(email, password)}>Sign in</Button>
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
        // <Stack>
        //     <Input
        //     type="text"
        //     value={email}
        //     onChange={(e) => setEmail(e.target.value)}
        //     placeholder="E-mail Address"
        //     />
        //     <Input
        //     type="password"
        //     value={password}
        //     onChange={(e) => setPassword(e.target.value)}
        //     placeholder="Password"
        //     />
        //     <Button
        //     onClick={() => logInWithEmailAndPassword(email, password)}
        //     >
        //     Login
        //     </Button>
        //     <Button className="login__btn login__google" onClick={signInWithGoogle}>
        //     Login with Google
        //     </Button>
        //     <Button>
        //     <Link to="/reset">Forgot Password</Link>
        //     </Button>
        //     <Box>
        //         Don't have an account? 
        //     </Box>
        //     <Button>
        //         <Link to="/register">Register now.</Link>
        //     </Button>
        // </Stack>
    );
}
export default Login;