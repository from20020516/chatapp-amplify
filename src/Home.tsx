import React, { useContext, useState, useEffect, useRef } from 'react'
import {
    Button,
    Dimensions,
    FlatList,
    Image,
    Pressable,
    ScaledSize,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'
import { DataStore } from 'aws-amplify'
import { Todo } from './models'
import { UserContext } from '../App'

const window = Dimensions.get("window")
const screen = Dimensions.get("screen")

const timeout = 10

const Item = ({ item, deleteTodo }: { item: Todo, deleteTodo: (todo: Todo) => Promise<void> }) => {
    const [count, setCount] = useState(timeout - Math.floor((Number(new Date()) - Number(new Date(item.createdAt!))) / 1000))

    useEffect(() => {
        if (0 >= count) deleteTodo(item)
        let timeoutId = setTimeout(() => setCount(count - 1), 1000)
        return () => clearTimeout(timeoutId)
    }, [count, item.updatedAt])

    return (
        <Pressable
            onLongPress={() => deleteTodo(item)}
            style={styles.todoContainer}
        >
            <Image
                style={{ width: 50, height: 50, marginRight: 10 }}
                source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}

            />
            <Text style={styles.todoHeading}>{item.description}</Text>
            <Text style={styles.timer}>{count}</Text>
        </Pressable>
    )
}

const TodoList = () => {
    const user = useContext(UserContext)
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

    const deleteTodo = async (todo: Todo) => {
        if (user?.username === todo.owner) await DataStore.delete(todo)
    }

    const renderItem = ({ item }: { item: Todo }) => <Item
        item={item}
        deleteTodo={deleteTodo}
    />

    return (
        <FlatList
            data={todos}
            keyExtractor={({ id }) => id}
            renderItem={renderItem}
        />
    )
}

const Home = () => {
    const [description, setDescription] = useState('')
    const [dimensions, setDimensions] = useState({ window, screen })

    useEffect(() => {
        const listener = ({ window, screen }: { window: ScaledSize, screen: ScaledSize }) => setDimensions({ window, screen })
        Dimensions.addEventListener('change', listener)
        return () => Dimensions.removeEventListener('change', listener)
    }, [])

    const addTodo = async () => {
        await DataStore.save(new Todo({ description }))
        setDescription('')
    }

    const scrollView = useRef<ScrollView>(null)

    return (
        <>
            <ScrollView
                ref={scrollView}
                style={{ maxHeight: dimensions.window.height - 110 }}
                onContentSizeChange={() => {
                    console.log(true)
                    scrollView.current?.scrollToEnd({ animated: true })
                }}
            >
                <TodoList />
            </ScrollView>
            <View
                style={{ height: 75 }}
            >
                <TextInput
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
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    todoContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 2,
        elevation: 4,
        flexDirection: 'row',
        marginHorizontal: 8,
        marginVertical: 4,
        padding: 8,
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    todoHeading: {
        fontSize: 20,
        fontWeight: '600',
    },
    timer: {
        marginLeft: 'auto',
        textAlign: 'center',
        color: 'grey'
    },
})

export default Home
