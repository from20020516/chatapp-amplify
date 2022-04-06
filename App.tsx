import React, { useEffect, useState } from 'react'
import { Button, StyleSheet, Platform, Text, View } from 'react-native'
import { Amplify, Auth, Hub } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import awsconfig from './src/aws-exports'
import Home from './src/Home'

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    redirectSignIn: `${window.location.origin}/`,
    redirectSignOut: `${window.location.origin}/`,
  }
})

const App = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    Hub.listen('auth', async ({ payload: { event, data } }) => {
      console.log(event, data)
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          setUser(await getUser())
          break
        case 'signOut':
          setUser(null)
          break
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data)
          break
      }
    });
    (async () => setUser(await getUser()))()
  }, [])

  const getUser = async () => {
    try {
      return await Auth.currentAuthenticatedUser()
    } catch (error) {
      return console.error(error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>User: {user ? JSON.stringify(user.attributes) : 'None'}</Text>
      </View>
      {user ? (
        <>
          <Home />
          <Button title="Sign Out" onPress={() => Auth.signOut()} />
        </>
      ) : (
        <Button title="Federated Sign In" onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
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
})

export default App
