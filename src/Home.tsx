import React, { useContext, useState, useEffect } from 'react'
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    ScrollView,
    Button,
} from 'react-native'
import { DataStore } from 'aws-amplify'
import { Todo } from './models'
import { UserContext } from '../App'

const Item = ({ item, deleteTodo }: { item: Todo, deleteTodo: (todo: Todo) => Promise<void> }) => {
    useEffect(() => {
        /** delete in 60 second. */
        // let timeoutId = setTimeout(() => deleteTodo(item), 60 * 1000)
        // return () => clearTimeout(timeoutId)
    }, [item.updatedAt])

    return (
        <Pressable
            onLongPress={() => deleteTodo(item)}
            style={styles.todoContainer}
        >
            <Image
                style={{ width: 50, height: 50, marginRight: 10 }}
                source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
            />
            <Text>
                <Text style={styles.todoHeading}>{item.description}</Text>
            </Text>
        </Pressable>
    )
}

const TodoList = () => {
    const user = useContext(UserContext)
    const [todos, setTodos] = useState<Todo[]>([])

    useEffect(() => {
        //query the initial todolist and subscribe to data updates
        const subscription = DataStore.observeQuery(Todo).subscribe((snapshot) => {
            //isSynced can be used to show a loading spinner when the list is being loaded.
            const { items, isSynced } = snapshot
            setTodos(items)
        });
        //unsubscribe to data updates when component is destroyed so that we don’t introduce a memory leak.
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

    const addTodo = async () => {
        await DataStore.save(new Todo({ description }))
        setDescription('')
    }

    return (
        <>
            <ScrollView
                style={{
                    // maxHeight: 800
                }}
            >
                <TodoList />
            </ScrollView>
            <View>
                <TextInput
                    onChangeText={setDescription}
                    placeholder="メッセージ"
                    style={{
                        borderBottomWidth: 1,
                        marginBottom: 16,
                        padding: 8,
                    }}
                    value={description}
                />
                <Button title="送信" onPress={addTodo} />
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
})

export default Home
