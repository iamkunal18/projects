#include <bits/stdc++.h>
using namespace std;

//declaring vector of parent of every node and size of connected component
vector<int> parent, sze;
    
//finding parent node of a connected component
int findPar(int node) {
    if(node == parent[node]){
        return node;
    }
    return parent[node] = findPar(parent[node]);
}

//making a parent node for all nodes of a connected network
void unionBySize(int u, int v) {
    int parent_u = findPar(u);
    int parent_v = findPar(v);
    if(parent_u == parent_v) return;
    if(sze[parent_u] < sze[parent_v]) {
        parent[parent_u] = parent_v;
        sze[parent_v] += sze[parent_u];
    } else {
        parent[parent_v] = parent_u;
        sze[parent_u] += sze[parent_v];
    }
}

// function for getting minimum adjustment of cable to
// make all the workstations connected. 
int solve(int n, vector<vector<int>>& edge) {
    parent.resize(n+1);
    sze.resize(n+1);
    for(int i = 0; i <= n; i++) {
        parent[i] = i;
        sze[i] = 1;
    }
    int count_extra_cable = 0;
    for(auto it : edge) {
        int u = it[0];
        int v = it[1];
        if(findPar(u) == findPar(v)) {
            count_extra_cable++;
        } else {
            unionBySize(u, v);
        }
    }
    int count_connected_components = 0;
    for(int i = 0; i < n; i++) {
        if(parent[i] == i) count_connected_components++;
    }
    int required_cable = count_connected_components - 1; 
    if(count_extra_cable >= required_cable) 
        return required_cable;
    else 
        return -1;
}

int main() {
    // n -> no of workstations in network
    // m -> no of connections by ethernet cable
    int n, m;
    cin >> n >> m; //taking input of n and m
    
    //storing connected nodes in network
    vector<vector<int>> connections;
    for(int i=0; i < m; i++) {
        vector<int> temp;
        for(int j =0; j<2; j++) {
            int x;
            cin>>x;
            temp.push_back(x);
        }
        connections.push_back(temp);
    }
    
    // calling function for getting minimum adjustment of cable to
    // make all the workstations connected. 
    cout<< solve(n, connections)<<"\n";
}