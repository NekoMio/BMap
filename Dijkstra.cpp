#ifndef Dijkstra
#define Dijkstra
#include <cstring>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;
class B_Map
{
public:
    struct ro
    {
        int to, next;
        int l;
    } *road;
    int *distance, *A, cnt, *pre;
    B_Map(int N = 100) {
        road = (ro*)malloc(N * sizeof(ro));
        distance = (int*)malloc(N * sizeof(int));
        A = (int*)malloc(N * sizeof(int));
        pre = (int*)malloc(N * sizeof(int));
    }
    typedef pair<int, int> T;
    vector<int> Q;
    void build(int from, int to)
    {
        cnt++;
        road[cnt].to = to;
        road[cnt].next = A[from];
        A[from] = cnt;
    }
    int dijkstra(int from, int to)
    {
        memset(distance, 0x3f, sizeof(distance));
        distance[from] = 0;
        memset(pre, -1, sizeof(pre));
        pre[from] = 0;
        Q.clear();
        priority_queue<T, vector<T>, greater<T>> q1;
        q1.push(make_pair(0, from));
        while (!q1.empty())
        {
            T X = q1.top();
            int x = X.second;
            if (distance[x] < X.first)
                continue;
            for (int i = A[x]; i; i = road[i].next)
            {
                int y = road[i].to;
                if (distance[y] > distance[x] + road[i].l)
                {
                    distance[y] = distance[x] + road[i].l;
                    pre[y] = x;
                    q1.push(make_pair(distance[y], y));
                }
            }
        }
        int now = to;
        while (now)
        {
            Q.push_back(now);
            now = pre[now];
        }
        reverse(Q.begin(), Q.end());
        return distance[to];
    }
};

#endif