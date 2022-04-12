import React, { createContext, useEffect, useState } from 'react'
import { Button, Text, View, Dimensions, ScaledSize } from 'react-native'
import { Amplify, Auth, AuthModeStrategyType, Hub } from 'aws-amplify'
import awsconfig from './src/aws-exports'
import Home from './src/Home'
import styles from './src/styles'

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    redirectSignIn: `${location.origin}/`,
    redirectSignOut: `${location.origin}/`,
  },
  DataStore: {
    authModeStrategyType: AuthModeStrategyType.MULTI_AUTH
  }
})

const window = Dimensions.get("window")
const screen = Dimensions.get("screen")

interface IUser {
  id: string
  username: string
  attributes: {
    email: string
    email_verified: boolean
    identities: string
    sub: string
  }
}
export const UserContext = createContext<IUser | null>(null)

interface IDimensions {
  window: ScaledSize
  screen: ScaledSize
}
export const DimensionContext = createContext<IDimensions | null>(null)

const App = () => {
  const [user, setUser] = useState<IUser | null>(null)
  const [dimensions, setDimensions] = useState({ window, screen })

  useEffect(() => {
    const dimensionsListener = ({ window, screen }: IDimensions) => setDimensions({ window, screen })
    Dimensions.addEventListener('change', dimensionsListener)
    return () => Dimensions.removeEventListener('change', dimensionsListener)
  }, [])

  useEffect(() => {
    (async () => setUser(await Auth.currentUserInfo()))()
    return () => Hub.remove('auth', () => setUser(null))
  }, [])

  return (
    <UserContext.Provider value={user}>
      <DimensionContext.Provider value={dimensions}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            {user ? (
              <Button title="Sign Out" onPress={() => Auth.signOut()} />
            ) : (
              <Text
                style={styles.headerTitle}
              >Flash⚡Chat</Text>
            )}
          </View>
          <Home />
        </View>
      </DimensionContext.Provider>
    </UserContext.Provider>
  )
}

export default App
