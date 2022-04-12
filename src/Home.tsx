import React, { useContext, useState, useEffect, useRef, memo } from 'react'
import {
    Button,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native'
import { Auth, DataStore } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import * as WebBrowser from 'expo-web-browser'
import { Todo } from './models'
import { DimensionContext, UserContext } from '../App'
import styles, { stylesProps } from './styles'

const timeout = 10

const Timer = ({ item }: { item: Todo }) => {
    const [count, setCount] = useState(timeout - Math.floor((Number(new Date()) - Number(new Date(item.createdAt!))) / 1000))

    useEffect(() => {
        if (0 >= count) DataStore.delete(item)
        let timeoutId = setTimeout(() => setCount(count - 1), 1000)
        return () => clearTimeout(timeoutId)
    }, [count, item.updatedAt])

    return (<Text style={styles.timer}>{count}</Text>)
}

const Item = memo(({ item }: { item: Todo }) => {
    const message = item.description!.split(/\s/)

    return (
        <Pressable
            onLongPress={() => DataStore.delete(item)}
            style={styles.todoContainer}
        >
            <Image
                style={{ width: 50, height: 50, marginRight: 10 }}
                source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}

            />
            {message.map((text, index) => text.startsWith('http')
                ? <Text key={index} onPress={() => WebBrowser.openBrowserAsync(text)} style={{ color: 'blue' }}>{text} </Text>
                : <Text key={index}>{text} </Text>
            )}
            <Timer item={item} />
        </Pressable>
    )
})

const TodoList = memo(() => {
    const [todos, setTodos] = useState<Todo[]>([])

    useEffect(() => {
        const subscription = DataStore
            .observeQuery(Todo, q => q.createdAt("ge", new Date(Date.now() - timeout * 1000).toISOString()))
            .subscribe((snapshot) => {
                //isSynced can be used to show a loading spinner when the list is being loaded.
                const { items, isSynced } = snapshot
                setTodos(items)
            })
        return () => subscription.unsubscribe()
    }, [])

    const renderItem = ({ item }: { item: Todo }) => <Item item={item} />

    return (
        <FlatList
            data={todos}
            keyExtractor={({ id }) => id}
            renderItem={renderItem}
        />
    )
})

const Home = () => {
    const user = useContext(UserContext)
    const dimensions = useContext(DimensionContext)
    const [description, setDescription] = useState('')

    const textInput = useRef<TextInput>(null)
    const addTodo = async () => {
        if (description.length) await DataStore.save(new Todo({ description }))
        setDescription('')
        textInput.current?.focus()
    }

    const scrollView = useRef<ScrollView>(null)
    const maxHeight =
        dimensions!.window.height!
        - Number(stylesProps.headerContainer.height)
        - Number(stylesProps.footer.height)

    return (
        <>
            <ScrollView
                ref={scrollView}
                style={{ maxHeight }}
                onContentSizeChange={() => scrollView.current?.scrollToEnd({ animated: true })}
            >
                <TodoList />
            </ScrollView>
            <View
                style={styles.footer}
            >
                {user ? (
                    <>
                        <TextInput
                            ref={textInput}
                            onChangeText={setDescription}
                            onSubmitEditing={addTodo}
                            placeholder="メッセージ"
                            style={{
                                backgroundColor: 'lightgrey',
                                borderBottomWidth: 1,
                                height: 35,
                                padding: 10,
                            }}
                            value={description}
                        />
                        <Button
                            title="送信"
                            onPress={addTodo}
                        />
                    </>
                ) : (
                    <>
                        <Button
                            title="Sign In with Google"
                            onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })}
                        />
                        <Text style={{ textAlign: 'center', padding: 10 }}>Copyright</Text>
                    </>
                )}
            </View>
        </>
    )
}

export default Home
