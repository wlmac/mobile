import * as React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View } from '../components/Themed';
import { useState } from 'react';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';
import filter from 'lodash.filter'


export function SearchBar({}) {
  const [text, setText] = useState(" ");
  var data =[
    {id: '127', room: "gym", latitude: 43.75376776088882, longitude: -79.46106695372214}
  ];
  const [state, setState] = useState({
    query: '',
    fullData: data
  })
  

  const handleSearch = (text: string) => {
    const formattedQuery = text.toLowerCase()
    const data = filter(state.fullData, (room: any) => {
      return contains(room, formattedQuery)
    })
    setState({ fullData:data , query: text })
    console.log('refreshed :) '+ data)
  }

  const contains = ({room }: any, query: any) => {
    console.log("run")
    room.toLowerCase(); 
    if ( room.includes(query)) {
      return true
    }
    return false
  }

  const renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '86%',
          backgroundColor: '#CED0CE',
          marginLeft: '5%'
        }}
      />
    )
  }

  return (
    <View style={{padding: 10}}>
      <FlatList
          data={state.fullData}
          keyExtractor={item=>item.room}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => alert('Item pressed!')}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 16,
                  alignItems: 'center'
                }}>
                <Text
                  style={{
                    color: '#000'
                  }}>
                    {`${item.room}`}
                  </Text>
              </View>
            </TouchableOpacity>
          )}
          extraData={state.fullData}
          ItemSeparatorComponent={renderSeparator}
          ListHeaderComponent={
            <View
              style={{
                backgroundColor: '#fff',
                padding: 10,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TextInput
                  style={{height: 40}}
                  placeholder="Search"
                  onChangeText={text => handleSearch(text)}
                  defaultValue={text}
                />
            </View>
          }
          />

    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer:{
    width: '100%',
    height: '100%', 
    backgroundColor: 'white',
    borderRadius: 8
  }, 
  searchBar:{
    width: '100%', 
    height: '100%', 
    paddingLeft: 8, 
    fontSize: 16
  }
});