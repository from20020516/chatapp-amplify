import React, { useState, useEffect } from 'react'
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Platform,
} from 'react-native'
import { DataStore, Predicates } from 'aws-amplify'
import { Todo } from './models'

const AddTodoModal = ({ modalVisible, setModalVisible }: { modalVisible: boolean, setModalVisible: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const addTodo = async () => {
        await DataStore.save(new Todo({ name, description, isComplete: false }))
        setModalVisible(false)
        setName('')
        setDescription('')
    }

    const closeModal = () => {
        setModalVisible(false)
    }

    return (
        <Modal
            animationType="fade"
            onRequestClose={closeModal}
            transparent
            visible={modalVisible}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalInnerContainer}>
                    <Pressable onPress={closeModal} style={styles.modalDismissButton}>
                        <Text style={styles.modalDismissText}>X</Text>
                    </Pressable>
                    <TextInput
                        onChangeText={setName}
                        placeholder="Name"
                        style={styles.modalInput}
                    />
                    <TextInput
                        onChangeText={setDescription}
                        placeholder="Description"
                        style={styles.modalInput}
                    />
                    <Pressable onPress={addTodo} style={styles.buttonContainer}>
                        <Text style={styles.buttonText}>Save Todo</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

const TodoList = () => {
    const [todos, setTodos] = useState<Todo[]>([])

    useEffect(() => {
        //query the initial todolist and subscribe to data updates
        const subscription = DataStore.observeQuery(Todo, Predicates.ALL).subscribe((snapshot) => {
            //isSynced can be used to show a loading spinner when the list is being loaded.
            const { items, isSynced } = snapshot
            console.log(items, isSynced)
            setTodos(items)
        });
        //unsubscribe to data updates when component is destroyed so that we don’t introduce a memory leak.
        return function cleanup() {
            subscription.unsubscribe()
        }
    }, [])

    const deleteTodo = async (todo: Todo) => {
        try {
            await DataStore.delete(todo)
        } catch (e) {
            console.log('Delete failed: $e')
        }
    }

    const setComplete = async (updateValue: boolean, todo: Todo) => {
        //update the todo item with updateValue
        await DataStore.save(
            Todo.copyOf(todo, updated => {
                updated.isComplete = updateValue
            })
        )
    }

    const renderItem = ({ item }: { item: Todo }) => (
        <Pressable
            onLongPress={() => {
                deleteTodo(item)
            }}
            onPress={() => {
                setComplete(!item.isComplete, item)
            }}
            style={styles.todoContainer}
        >
            <Text>
                <Text style={styles.todoHeading}>{item.name}</Text>
                {`\n${item.description}`}
            </Text>
            <Text
                style={[styles.checkbox, item.isComplete && styles.completedCheckbox]}
            >
                {item.isComplete ? '✓' : ''}
            </Text>
        </Pressable>
    )

    return (
        <FlatList
            data={todos}
            keyExtractor={({ id }) => id}
            renderItem={renderItem}
        />
    )
}

const Home = () => {
    const [modalVisible, setModalVisible] = useState(false)

    return (
        <>
            <TodoList />
            <Pressable
                onPress={() => {
                    setModalVisible(true)
                }}
                style={[styles.buttonContainer, styles.floatingButton]}
            >
                <Text style={styles.buttonText}>+ Add Todo</Text>
            </Pressable>
            <AddTodoModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
            />
        </>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#4696ec',
        paddingTop: Platform.OS === 'ios' ? 44 : 0,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        paddingVertical: 16,
        textAlign: 'center',
    },
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
    checkbox: {
        borderRadius: 2,
        borderWidth: 2,
        fontWeight: '700',
        height: 20,
        marginLeft: 'auto',
        textAlign: 'center',
        width: 20,
    },
    completedCheckbox: {
        backgroundColor: '#000',
        color: '#fff',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        padding: 16,
    },
    buttonContainer: {
        alignSelf: 'center',
        backgroundColor: '#4696ec',
        borderRadius: 99,
        paddingHorizontal: 8,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 44,
        elevation: 6,
        shadowOffset: {
            height: 4,
            width: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    modalInnerContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        justifyContent: 'center',
        padding: 16,
    },
    modalInput: {
        borderBottomWidth: 1,
        marginBottom: 16,
        padding: 8,
    },
    modalDismissButton: {
        marginLeft: 'auto',
    },
    modalDismissText: {
        fontSize: 20,
        fontWeight: '700',
    },
})

export default Home
