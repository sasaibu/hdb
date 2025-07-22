import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {RootStackParamList} from '../types/navigation';

type Props = StackScreenProps<RootStackParamList, 'OpenSourceLicenses'>;

const OpenSourceLicensesScreen: React.FC<Props> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.licenseItem}>
          <Text style={styles.libraryName}>React Native</Text>
          <Text style={styles.copyright}>Copyright (c) Meta Platforms, Inc. and affiliates.</Text>
          <Text style={styles.licenseType}>MIT License</Text>
          <Text style={styles.licenseText}>
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
            {'\n\n'}
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
            {'\n\n'}
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </Text>
        </View>

        <View style={styles.licenseItem}>
          <Text style={styles.libraryName}>React Navigation</Text>
          <Text style={styles.copyright}>Copyright (c) 2017 React Navigation Contributors</Text>
          <Text style={styles.licenseType}>MIT License</Text>
          <Text style={styles.licenseText}>
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
            {'\n\n'}
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
            {'\n\n'}
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </Text>
        </View>

        <View style={styles.licenseItem}>
          <Text style={styles.libraryName}>React Native Safe Area Context</Text>
          <Text style={styles.copyright}>Copyright (c) 2019 Th3rd Wave</Text>
          <Text style={styles.licenseType}>MIT License</Text>
          <Text style={styles.licenseText}>
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
            {'\n\n'}
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
            {'\n\n'}
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </Text>
        </View>

        <View style={styles.licenseItem}>
          <Text style={styles.libraryName}>React Native Screens</Text>
          <Text style={styles.copyright}>Copyright (c) 2018 Software Mansion</Text>
          <Text style={styles.licenseType}>MIT License</Text>
          <Text style={styles.licenseText}>
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
            {'\n\n'}
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
            {'\n\n'}
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </Text>
        </View>

        <View style={styles.licenseItem}>
          <Text style={styles.libraryName}>React Native WebView</Text>
          <Text style={styles.copyright}>Copyright (c) 2015-present, Facebook, Inc.</Text>
          <Text style={styles.licenseType}>MIT License</Text>
          <Text style={styles.licenseText}>
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
            {'\n\n'}
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
            {'\n\n'}
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </Text>
        </View>

        <View style={styles.licenseItem}>
          <Text style={styles.libraryName}>TypeScript</Text>
          <Text style={styles.copyright}>Copyright (c) Microsoft Corporation</Text>
          <Text style={styles.licenseType}>Apache License 2.0</Text>
          <Text style={styles.licenseText}>
            Licensed under the Apache License, Version 2.0 (the "License");
            you may not use this file except in compliance with the License.
            You may obtain a copy of the License at
            {'\n\n'}
            http://www.apache.org/licenses/LICENSE-2.0
            {'\n\n'}
            Unless required by applicable law or agreed to in writing, software
            distributed under the License is distributed on an "AS IS" BASIS,
            WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            See the License for the specific language governing permissions and
            limitations under the License.
          </Text>
        </View>

        <View style={styles.licenseItem}>
          <Text style={styles.libraryName}>Jest</Text>
          <Text style={styles.copyright}>Copyright (c) Meta Platforms, Inc. and affiliates.</Text>
          <Text style={styles.licenseType}>MIT License</Text>
          <Text style={styles.licenseText}>
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
            {'\n\n'}
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
            {'\n\n'}
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  licenseItem: {
    marginBottom: 24,
  },
  libraryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  licenseType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  licenseText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
});

export default OpenSourceLicensesScreen;