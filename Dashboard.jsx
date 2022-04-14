import React, { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db, logout } from './firebase'
import {
  query,
  collection,
  getDocs,
  where,
  updateDoc,
  arrayUnion,
  doc,
  orderBy,
  deleteField,
  onSnapshot,
  getDoc
} from 'firebase/firestore'
import DatePicker from 'react-datepicker'
import { BellIcon, ChatIcon, CheckIcon, ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons'
import 'react-datepicker/dist/react-datepicker.css'
import {
  Input,
  Box,
  Button,
  Center,
  HStack,
  OrderedList,
  ListItem,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Text,

  Stack,
  StackDivider,

  List,
  ListIcon,
  useColorModeValue,
  Divider,
  Container,
  Grid
} from '@chakra-ui/react'
import './styles.css'

import { async } from '@firebase/util'
import { auto } from '@popperjs/core'

function Dashboard () {
  const [user, loading, error] = useAuthState(auth)
  const [startDate, setStartDate] = useState(new Date())
  const [name, setName] = useState('')
  const [level, setLevel] = useState('')
  const [paid, setPaid] = useState([])
  const [notPaid, setNotPaid] = useState([])
  const [members, setMembers] = useState([])
  const [messages, setMessages] = useState('')
  const [reminder, setReminder] = useState(false)
  const navigate = useNavigate()
  const fetchUserName = async () => {
    try {
      const q = query(collection(db, 'users'), where('uid', '==', user.uid))
      const doc = await getDocs(q)
      const data = doc.docs[0].data()
      setName(data.name)
      setLevel(data.level)
      setNotPaid(data.unpaid)
      setPaid(data.paid)
      setMessages(data.messages)
      setReminder(data.reminder)
    } catch (err) {
      console.error(err)
      alert('An error occured while fetching user data')
    }
  }

  const fetchMembers = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('level', '==', 'member'),
        orderBy('unpaid', 'asc')
      )
      const doc = await getDocs(q)
      const names = []
      doc.forEach(doc => {
        if (doc.data().unpaid.length != 0) {
          names.push({ name: doc.data().name, boolean: true })
        } else {
          names.push({ name: doc.data().name, boolean: false })
        }
      })
      setMembers(names)
    } catch (err) {
      console.error(err)
      alert('An error occured while fetching user data')
    }
  }
  const sendMessage = async (member, message) => {
    console.log(member)
    const q = query(
      collection(db, 'users'),
      where('name', '==', member),
      where('level', '==', 'member')
    )
    const userDoc = await getDocs(q)
    const uid = userDoc.docs[0].data().uid
    await updateDoc(doc(db, 'users', uid), {
      messages: message
    })
  }

  const sendReminder = async member => {
    const q = query(
      collection(db, 'users'),
      where('name', '==', member),
      where('level', '==', 'member')
    )
    const userDoc = await getDocs(q)
    const uid = userDoc.docs[0].data().uid
    await updateDoc(doc(db, 'users', uid), {
      reminder: true
    })
  }

  const removeMember = async member => {
    const q = query(
      collection(db, 'users'),
      where('name', '==', member),
      where('level', '==', 'member')
    )
    const userDoc = await getDocs(q)
    const uid = userDoc.docs[0].data().uid
    await updateDoc(doc(db, 'users', uid), {
      unpaid: deleteField(),
      paid: deleteField(),
      messages: 'You have been removed from all classes',
      unpaid: [],
      paid: []
    })
  }


  useEffect(() => {
    if (loading) return
    if (!user) return navigate('/')
    fetchUserName()
    fetchMembers()
  }, [user, loading])

  function MemberDashboard () {
    
    const addPractice = async () => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          unpaid: arrayUnion(startDate)
        })
      } catch (err) {
        alert(err.message)
      }
      window.location.reload()
    }

    const ToDate = e => {
      const date = new Date(e.unixTime * 1000)
      return <>{date.toLocaleDateString()}</>
    }

    const viewedMessage = async () => {
      await updateDoc(doc(db, 'users', user.uid), {
        messages: ''
      })
    }

    const viewedReminder = async () => {
      await updateDoc(doc(db, 'users', user.uid), {
        reminder: false
      })
    }

    const paySession = async => {
        window.open('https://buy.stripe.com/test_3cs3dddBG8za0QU4gh')
    }


    return (
        <><Grid container>
            <Box
                maxW={'container.md'}
                maxH={'max-content'}
                w={'container.lg'}
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow={'xl'}
                rounded={'md'}
                overflow={'hidden'}>
                <Stack
                    textAlign={'left'}
                    p={7}
                    color={useColorModeValue('gray.800', 'white')}
                    align={'left'}>
                    <Stack direction={'row'} align={'left'} justify={'left'}>
                    <Text fontSize={'5xl'}>Hello, {" "} </Text>
                    <Text fontSize={'5xl'} fontWeight={700}>
                    
                    {name}
                    </Text>
                    </Stack>
                </Stack>

                <Box 
                    bg={useColorModeValue('gray.50', 'gray.900')} px={'0.5rem'} direction={'row'} align={'left'} justify={'left'}>

                <Box bg={useColorModeValue('gray.50', 'gray.900')} px={0} py={3}>
                    <Text fontSize={'2xl'} fontWeight="medium"
                    >Unpaid Sessions </Text>
                    <Divider h={3} maxW="fit-content" ></Divider>
                    <OrderedList spacing={3} px={2} fontSize="sm">
                    {notPaid.map(session => (
                        <ListItem key={session} py={2} fontWeight='normal'>
                            <ToDate unixTime={session.seconds} />
                            <StackDivider></StackDivider>
                            <Button
                                mt={1}
                                onClick={paySession} 
                                fontSize="sm"
                                w={'min'}
                                bg={'gray.600'}
                                color={'white'}
                                rounded={'xl'}
                                _hover={{
                                    bg: 'green.400',
                                }}
                                _focus={{
                                    bg: 'green.400',
                                }}>
                                Pay Session
                            </Button>
                        </ListItem>
                    ))}
                    </OrderedList>
                </Box>
                <HStack>
                
                <Box m={3}>
                <Text fontSize={'xl'} fontWeight="medium"  
                >Book New Sessions</Text>
                    <DatePicker
                        selected={startDate}
                        onChange={date => setStartDate(date)} />
                
                <Button
                    marginTop={4}
                    onClick={paySession} 
                    fontSize="md"
                    w={'min-content'}
                    bg={'gray.600'}
                    color={'white'}
                    rounded={'xl'}
                    _hover={{
                        bg: 'green.400',
                    }}
                    _focus={{
                        bg: 'green.400',
                    }}>
                    Confirm
                </Button>
                </Box>
                </HStack>      
                </Box>
            </Box>
            <Button 
            
             m={5} onClick={logout}>Logout</Button>

        </Grid>
        

                <Box>
                    <Box>
                        {messages && (
                            <Box>
                                Message from coach: {messages}
                                <Button onClick={viewedMessage}>
                                    <CheckIcon />
                                </Button>
                            </Box>
                        )}
                    </Box>
                    <Box>
                        {reminder == true && (
                            <Box>
                                You have a payment reminder
                                <Button onClick={viewedReminder}>
                                    <CheckIcon />
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>

            </>
    )
  }
  function TreasurerDashboard () {
    const [sort, setSort] = useState(true)
    const [member, setMember] = useState('')
    const [message, setMessage] = useState('')

    return (
      <Center>
        <VStack spacing={5}>
          <Box>Logged in as: {name}</Box>
          <Button onClick={() => setSort(!sort)}>Sort</Button>
          <Box>
            {sort ? (
              <Box>
                Sorted by Least Paid Members
                <Center>Members</Center>
                <OrderedList>
                  {members
                    .slice()
                    .reverse()
                    .map(member => (
                      <ListItem key={member.name}>{member.name}</ListItem>
                    ))}
                </OrderedList>
              </Box>
            ) : (
              <Box>
                Sorted by Most Paid Members
                <Center>Members</Center>
                <OrderedList>
                  {members.map(member => (
                    <ListItem key={member.name}>{member.name}</ListItem>
                  ))}
                </OrderedList>
              </Box>
            )}
          </Box>

          <HStack spacing={3}>
            <Select
              placeholder='Select member'
              value={member}
              onChange={e => setMember(e.target.value)}
            >
              {members.map(member => (
                <option key={member.name} value={member.name}>
                  {member.name}
                </option>
              ))}
            </Select>
            <FormControl>
              <FormLabel>
                <Input
                  id='message'
                  type='text'
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder='Message'
                />
              </FormLabel>
            </FormControl>
            <Button onClick={() => sendMessage(member, message)}>
              <ChatIcon />
            </Button>
            <Button onClick={() => sendReminder(member)}>
              <BellIcon />
            </Button>
            <Button onClick={() => removeMember(member)}>
              <DeleteIcon />
            </Button>
          </HStack>
          <Button onClick={logout}>Logout</Button>
        </VStack>
      </Center>
    )
  }

  function CoachDashboard () {
    const [member, setMember] = useState('')
    const [message, setMessage] = useState('')

    return (
      <Center>
        <VStack spacing={5}>
          <Box>Logged in as: {name}</Box>
          <Box>
            Members
            <OrderedList>
              {members.map(member => (
                <ListItem key={member.name}>{member.name}</ListItem>
              ))}
            </OrderedList>
          </Box>

          <HStack spacing={3}>
            <Select
              placeholder='Select member'
              value={member}
              onChange={e => setMember(e.target.value)}
            >
              {members.map(member => (
                <option key={member.name} value={member.name}>
                  {member.name}
                </option>
              ))}
            </Select>
            <FormControl>
              <FormLabel>
                <Input
                  id='message'
                  type='text'
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder='Message'
                />
              </FormLabel>
            </FormControl>
            <Button onClick={() => sendMessage(member, message)}>
              <ChatIcon />
            </Button>
            <Button onClick={() => sendReminder(member)}>
              <BellIcon />
            </Button>
          </HStack>
          <Button onClick={logout}>Logout</Button>
        </VStack>
      </Center>
    )
  }

  function DisplayDashBoard () {
    if (level === 'member') return <MemberDashboard />
    if (level === 'treasurer') return <TreasurerDashboard />
    if (level === 'coach') return <CoachDashboard />
  }

  return <DisplayDashBoard />
}
export default Dashboard
