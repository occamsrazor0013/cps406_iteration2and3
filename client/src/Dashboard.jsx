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
  arrayRemove,
  doc,
  orderBy,
  deleteField,
  onSnapshot,
  getDoc
} from 'firebase/firestore'
import DatePicker from 'react-datepicker'
import { 
  BellIcon, 
  ChatIcon, 
  CheckIcon, 
  DeleteIcon,
  EditIcon,
  RepeatClockIcon
} from '@chakra-ui/icons'
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
  Grid,
  Spacer, 
  InputGroup, 
  InputLeftElement,
  InputRightElement,
  Flex,

} from '@chakra-ui/react'
import './styles.css'

export default function Dashboard () {
  const [user, loading, error] = useAuthState(auth)
  const [startDate, setStartDate] = useState(new Date())
  const [name, setName] = useState('')
  const [level, setLevel] = useState('')
  const [paid, setPaid] = useState([])
  const [unpaid, setUnpaid] = useState([])
  const [members, setMembers] = useState([])
  const [messages, setMessages] = useState('')
  const [reminder, setReminder] = useState(false)
  const [revenue, setRevenue]= useState(0)
  const [coachUnpaid, setCoachUnpaid] = useState(0)
  const [coachMonthlyUnpaid, setCoachMonthlyUnpaid] = useState([]);
  const navigate = useNavigate()

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, 'users'), where('uid', '==', user.uid))
      const doc = await getDocs(q)
      const data = doc.docs[0].data()
      setName(data.name)
      setLevel(data.level)
      setPaid(data.paid)
      setUnpaid(data.unpaid)
      setMessages(data.messages)
      setReminder(data.reminder)
    } catch (err) {
      console.error(err)
      alert('An error occured while fetching user data')
    }
  }

  const fetchMembers = async () => {
    try {
      var r = 0;
      var u = 0;
      let names = [];
      let monthly = [];
      const q = query(
        collection(db, 'users'),
        where('level', '==', 'member'),
      );
      const c = query(
        collection(db, 'users'),
        where('level', '==', 'coach'),
      );
      const memberDoc = await getDocs(q);
      const coachDoc = await getDocs(c);
      memberDoc.forEach(doc => {
        if (doc.data().paid.length !== 0 || doc.data().attended.length !== 0) {
          names.push({ 
            name: doc.data().name, 
            revenue: doc.data().paid.length+doc.data().attended.length,
            attended: doc.data().attended,
            paid: doc.data().paid,
            unpaid: doc.data().unpaid,
            attendance: doc.data().attended.length, 
            phone: doc.data().phone,
            address: doc.data().address
          });
          r += doc.data().paid.length;
        }
      })
      coachDoc.forEach(doc => {
        for (const v in doc.data().unpaid){
          u += (doc.data().unpaid[v])
          monthly.push((doc.data().unpaid[v]))
        }
      })
      setCoachUnpaid(u);
      setRevenue(r*10);
      setMembers(names);
      setCoachMonthlyUnpaid(monthly);
    } catch (err) {
      console.error(err)
      alert('An error occured while fetching user data')
    }
  }

  const sendMessage = async (member, message) => {
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

  const moveToPaid = async (session) => {
    await updateDoc(doc(db, 'users', user.uid), {
      unpaid: arrayRemove(session),
      paid: arrayUnion(session)
    })
  }

  const sendCoachUnpaid = async (payment) => {
    await updateDoc(doc(db, 'users', user.uid), {
      unpaid: arrayUnion(payment)
    })
  }

  const resetMonthlyUnpaid = async () => {
    await updateDoc(doc(db, 'users', user.uid), {
      unpaid: deleteField(),
      unpaid: []
    })
  }

  const openPayment = async () => {
    window.open('https://buy.stripe.com/test_3cs3dddBG8za0QU4gh');
  }

  const addSession = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        unpaid: arrayUnion(startDate)
      })
    } catch (err) {
      alert(err.message)
    }
    window.location.reload()
  }

  const moveToAttended = async (session) => {
    await updateDoc(doc(db, 'users', user.uid), {
      paid: arrayRemove(session),
      attended: arrayUnion(session)
    })
  }

  const ToDate = e => {
    const date = new Date(e.unixTime * 1000)
    return <>{date.toLocaleDateString()}, </>
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate('/');
    fetchUserName();
    fetchMembers();
  }, [user, loading, navigate, coachUnpaid])

  function MemberDashboard () {

    return (
        <>
          <Grid container>
            <Box
                maxW={'container.md'}
                maxH={'max-content'}
                w={'container.lg'}
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow={'xl'}
                rounded={'md'}>
                <Stack
                    textAlign={'left'}
                    p={7}
                    color={useColorModeValue('gray.800', 'white')}
                    align={'left'}>
                    <Stack direction={'row'} align={'left'} justify={'left'}>
                    <Text fontSize={'5xl'}>Hello, {" "} </Text>
                    <Text fontSize={'5xl'} fontWeight={700}>
                    
                    {name} ({level})
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
                    {unpaid.map(session => (
                        <ListItem key={session.seconds} py={2} fontWeight='normal'>
                            <ToDate unixTime={session.seconds} />
                            <StackDivider />
                            <Button
                                mt={1}
                                onClick={() => {
                                  openPayment();
                                  var s = new Date(session.seconds*1000);
                                  moveToPaid(s);
                                  }} 
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

                <Box bg={useColorModeValue('gray.50', 'gray.900')} px={0} py={3}>
                    <Text fontSize={'2xl'} fontWeight="medium"
                    >Paid Sessions </Text>
                    <Divider h={3} maxW="fit-content" ></Divider>
                    <OrderedList spacing={3} px={2} fontSize="sm">
                    {paid.map(session => (
                        <ListItem key={session.seconds} py={2} fontWeight='normal'>
                          <HStack>
                            <ToDate unixTime={session.seconds} />
                            <StackDivider />
                            <Button onClick={() => {
                              var s = new Date(session.seconds*1000);
                              moveToAttended(s);
                            }}>
                              <CheckIcon />
                            </Button>
                          </HStack>
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
                    onClick={addSession} 
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
                        {reminder === true && (
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
    const [totalProfit, setTotalProfit] = useState(revenue-coachUnpaid);

    return (
      <Box >
        <VStack spacing={8}>
          <Box>
            <Text pt="40%" fontSize={'5xl'}>Hello, {name} ({level}) </Text>
            <Center>
              <Button onClick={() => setSort(!sort)}>Sort</Button>
            </Center>
            {sort ? (
              <VStack spacing={4}>
                <Text fontSize={'xl'} fontWeight="medium">Sorted by Most Paid Members</Text>
                <OrderedList>
                  {members
                    .slice()
                    .sort((a, b) => (a.revenue > b.revenue) ? 1 : -1)
                    .reverse()
                    .map(member => (
                      <ListItem key={member.name}>{member.name}</ListItem>
                    ))}
                </OrderedList>
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Text fontSize={'xl'} fontWeight="medium">Sorted by Least Paid Members</Text>
                <OrderedList>
                  {members.sort((a, b) => (a.revenue > b.revenue) ? 1 : -1).map(member => (
                    <ListItem key={member.name}>{member.name}</ListItem>
                  ))}
                </OrderedList>
              </VStack>
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
          <Box>
            <VStack>
            <Text fontSize='2xl'>Club Finances</Text>
              <Flex w="140%">
                  <Box>Revenue: </Box>
                  <Spacer />
                  <Box>${revenue}</Box>
              </Flex>
              <Flex w="140%">
                  <Box>Current debts: </Box>
                  <Spacer />
                  <Box>${coachUnpaid}</Box>
              </Flex>
              <Flex w="140%">
                  <Box>Total Profit: </Box>
                  <Spacer />
                  <Box>${totalProfit}</Box>
              </Flex>
            </VStack>
          </Box>
          <Box>
            <VStack spacing={5}>
            <Text fontSize='2xl'>Monthly Expenses</Text>
            <OrderedList>
              {coachMonthlyUnpaid
                .slice()
                .sort((a, b) => (a < b) ? 1 : -1)
                .map(monthly => (
                  <ListItem key={monthly}>$ {monthly}</ListItem>
                ))}
            </OrderedList>
            </VStack>
          </Box>
          <Box>
            <Center fontSize='2xl'>Attendance</Center>
            <Box>
            <Center>Members</Center>
              <OrderedList>
                {members
                  .slice()
                  .sort((a, b) => (a.attendance < b.attendance) ? 1 : -1)
                  .map(member => (
                    <ListItem key={member.name}>Name: {member.name}, Attendance: {member.attendance}
                      <Box>
                        Address: {member.address}, Phone: {member.phone}
                      </Box>
                      <Box>
                        Attended: {member.attended.map(member => (
                        <ToDate unixTime={member.seconds} />))}
                      </Box>
                      <Box>
                        Paid: {member.paid.map(member => (
                        <ToDate unixTime={member.seconds} />))}
                      </Box>
                      <Box>
                        Unpaid: {member.unpaid.map(member => (
                        <ToDate unixTime={member.seconds} />))}
                      </Box>
                    </ListItem>
                  ))}
              </OrderedList>
            </Box>
          </Box>
          <Button onClick={logout}>Logout</Button>
        </VStack>
      </Box>
    )
  }

  function CoachDashboard () {
    const [sort, setSort] = useState(true)
    const [member, setMember] = useState('')
    const [message, setMessage] = useState('')
    const [payment, setPayment] = useState('')

    return (
      <Center>
        <VStack spacing={8}>
          <Stack
            textAlign={'left'}
            color={useColorModeValue('gray.800', 'white')}
            align={'left'}>
            <Stack direction={'row'} align={'left'} justify={'left'}>
            <Text fontSize={'5xl'}>Hello, {" "} </Text>
            <Text fontSize={'5xl'} fontWeight={700}>
            
            {name} ({level})
            </Text>
            </Stack>
          </Stack>
          <Button onClick={() => setSort(!sort)}>Sort</Button>
          <Box>
            {sort ? (
              <VStack spacing={4}>
                <Text fontSize='2xl'>Sorted by Most Paid </Text>
                <Text fontSize='xl'>Members </Text>
                <OrderedList>
                  {members
                    .slice()
                    .reverse()
                    .map(member => (
                      <ListItem key={member.name}>{member.name}</ListItem>
                    ))}
                </OrderedList>
              </VStack>
            ) : (
              <VStack>
                <Text fontSize={'xl'} fontWeight="medium">Sorted by Least Paid </Text>
                <Center>Members</Center>
                <OrderedList>
                  {members.map(member => (
                    <ListItem key={member.name}>{member.name}</ListItem>
                  ))}
                </OrderedList>
              </VStack>
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
              <Input
                id='message'
                type='text'
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder='Message'
              />
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
          
          <Box>
            <HStack spacing={3}>
                  <Box>Unpaid payments: </Box>
                  <Spacer />
                  <InputGroup width='auto'>
                    <InputLeftElement
                      pointerEvents='none'
                      color='gray.300'
                      fontSize='1.2em'
                      children='$'
                    />
                    <Input 
                      placeholder='Enter amount' 
                      htmlSize={9} 
                      width='auto'
                      type='number'
                      onChange={e => setPayment(e.target.value)}
                      value={payment}/>
                    <InputRightElement children={<CheckIcon color='green.500' />} />
                  </InputGroup>
                  <Spacer />
                  <Button onClick={() => sendCoachUnpaid(parseInt(payment))}>
                    <EditIcon />
                  </Button>
                  <Spacer />
                  <Button onClick={resetMonthlyUnpaid}>
                    <RepeatClockIcon />
                  </Button>
            </HStack>
          </Box>
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

  return (
  <DisplayDashBoard />
  );
}
