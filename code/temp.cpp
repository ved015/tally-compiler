#include<iostream>
#include<vector>
using namespace std;
int main(){
    for(int i = 0; i < 5; i++){
        cout << i << " ";
    }
    cout << "finished" << endl;
    vector<int> nums;
    nums.push_back(2);
    cout << nums[0] << endl;
    return 0;
}