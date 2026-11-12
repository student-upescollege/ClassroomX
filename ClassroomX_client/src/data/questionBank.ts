export type Difficulty = "Easy" | "Medium" | "Hard";

export interface BankTestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface BankQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  defaultScore: number;
  testCases: BankTestCase[];
}

export interface QuestionBank {
  tag: string;
  label: string;
  description: string;
  questions: BankQuestion[];
}

export const DSA_BANK: QuestionBank = {
  tag: "DSA",
  label: "Data Structures & Algorithms",
  description: "Classic DSA problems covering arrays, strings, searching, sorting, and more.",
  questions: [
    // ─── EASY ───────────────────────────────────────────────────────────────────
    {
      id: "dsa-001",
      title: "Find Maximum Element",
      difficulty: "Easy",
      tags: ["Array", "Linear Scan"],
      defaultScore: 10,
      description: `Given an array of N integers, find and print the maximum element.

Input format:
  Line 1: N (number of elements)
  Line 2: N space-separated integers

Output format:
  A single integer — the maximum element

Example:
  Input:
    5
    3 7 1 9 4
  Output:
    9`,
      testCases: [
        { input: "5\n3 7 1 9 4", expectedOutput: "9", isHidden: false },
        { input: "4\n-1 -5 -2 -8", expectedOutput: "-1", isHidden: false },
        { input: "1\n42", expectedOutput: "42", isHidden: true },
        { input: "6\n100 200 150 300 250 50", expectedOutput: "300", isHidden: true },
      ],
    },
    {
      id: "dsa-002",
      title: "Sum of Array",
      difficulty: "Easy",
      tags: ["Array", "Linear Scan"],
      defaultScore: 10,
      description: `Given an array of N integers, compute and print their sum.

Input format:
  Line 1: N
  Line 2: N space-separated integers

Output format:
  A single integer — the sum

Example:
  Input:
    4
    1 2 3 4
  Output:
    10`,
      testCases: [
        { input: "4\n1 2 3 4", expectedOutput: "10", isHidden: false },
        { input: "3\n-1 5 -4", expectedOutput: "0", isHidden: false },
        { input: "1\n0", expectedOutput: "0", isHidden: true },
        { input: "5\n10 20 30 40 50", expectedOutput: "150", isHidden: true },
      ],
    },
    {
      id: "dsa-003",
      title: "Reverse an Array",
      difficulty: "Easy",
      tags: ["Array", "Two Pointers"],
      defaultScore: 10,
      description: `Given an array of N integers, print the array in reverse order.

Input format:
  Line 1: N
  Line 2: N space-separated integers

Output format:
  N space-separated integers in reverse order

Example:
  Input:
    5
    1 2 3 4 5
  Output:
    5 4 3 2 1`,
      testCases: [
        { input: "5\n1 2 3 4 5", expectedOutput: "5 4 3 2 1", isHidden: false },
        { input: "3\n7 8 9", expectedOutput: "9 8 7", isHidden: false },
        { input: "1\n42", expectedOutput: "42", isHidden: true },
        { input: "4\n-3 0 5 -1", expectedOutput: "-1 5 0 -3", isHidden: true },
      ],
    },
    {
      id: "dsa-004",
      title: "Check Palindrome",
      difficulty: "Easy",
      tags: ["String", "Two Pointers"],
      defaultScore: 10,
      description: `Given a string, determine whether it is a palindrome.
A palindrome reads the same forwards and backwards (case-sensitive, ignore spaces).

Input format:
  A single string (no leading/trailing spaces)

Output format:
  "true" if palindrome, "false" otherwise

Example:
  Input:
    racecar
  Output:
    true`,
      testCases: [
        { input: "racecar", expectedOutput: "true", isHidden: false },
        { input: "hello", expectedOutput: "false", isHidden: false },
        { input: "madam", expectedOutput: "true", isHidden: true },
        { input: "abcba", expectedOutput: "true", isHidden: true },
        { input: "OpenAI", expectedOutput: "false", isHidden: true },
      ],
    },
    {
      id: "dsa-005",
      title: "Fibonacci Number",
      difficulty: "Easy",
      tags: ["Math", "Dynamic Programming"],
      defaultScore: 10,
      description: `Given N, print the Nth Fibonacci number (0-indexed).
F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)

Input format:
  A single integer N (0 ≤ N ≤ 40)

Output format:
  A single integer — F(N)

Example:
  Input:
    6
  Output:
    8`,
      testCases: [
        { input: "6", expectedOutput: "8", isHidden: false },
        { input: "0", expectedOutput: "0", isHidden: false },
        { input: "1", expectedOutput: "1", isHidden: true },
        { input: "10", expectedOutput: "55", isHidden: true },
        { input: "15", expectedOutput: "610", isHidden: true },
      ],
    },
    {
      id: "dsa-006",
      title: "Binary Search",
      difficulty: "Easy",
      tags: ["Array", "Binary Search", "Searching"],
      defaultScore: 15,
      description: `Given a sorted array of N integers and a target, return the 0-based index of the target, or -1 if not found.

Input format:
  Line 1: N
  Line 2: N space-separated integers (sorted ascending)
  Line 3: target

Output format:
  The index of target, or -1

Example:
  Input:
    5
    1 3 5 7 9
    7
  Output:
    3`,
      testCases: [
        { input: "5\n1 3 5 7 9\n7", expectedOutput: "3", isHidden: false },
        { input: "5\n1 3 5 7 9\n6", expectedOutput: "-1", isHidden: false },
        { input: "1\n10\n10", expectedOutput: "0", isHidden: true },
        { input: "6\n2 4 6 8 10 12\n2", expectedOutput: "0", isHidden: true },
        { input: "6\n2 4 6 8 10 12\n12", expectedOutput: "5", isHidden: true },
      ],
    },
    {
      id: "dsa-007",
      title: "Count Occurrences",
      difficulty: "Easy",
      tags: ["Array", "Hashing"],
      defaultScore: 10,
      description: `Given an array of N integers and a target value, count how many times the target appears.

Input format:
  Line 1: N
  Line 2: N space-separated integers
  Line 3: target

Output format:
  A single integer — count of target

Example:
  Input:
    6
    1 2 3 2 4 2
    2
  Output:
    3`,
      testCases: [
        { input: "6\n1 2 3 2 4 2\n2", expectedOutput: "3", isHidden: false },
        { input: "4\n5 5 5 5\n5", expectedOutput: "4", isHidden: false },
        { input: "3\n1 2 3\n9", expectedOutput: "0", isHidden: true },
        { input: "5\n0 0 1 0 1\n0", expectedOutput: "3", isHidden: true },
      ],
    },
    {
      id: "dsa-008",
      title: "Bubble Sort",
      difficulty: "Easy",
      tags: ["Array", "Sorting"],
      defaultScore: 15,
      description: `Sort an array of N integers using Bubble Sort and print the sorted array.

Input format:
  Line 1: N
  Line 2: N space-separated integers

Output format:
  N space-separated integers sorted in ascending order

Example:
  Input:
    5
    5 3 8 1 2
  Output:
    1 2 3 5 8`,
      testCases: [
        { input: "5\n5 3 8 1 2", expectedOutput: "1 2 3 5 8", isHidden: false },
        { input: "3\n3 1 2", expectedOutput: "1 2 3", isHidden: false },
        { input: "4\n-3 0 -1 5", expectedOutput: "-3 -1 0 5", isHidden: true },
        { input: "1\n7", expectedOutput: "7", isHidden: true },
      ],
    },

    // ─── MEDIUM ──────────────────────────────────────────────────────────────────
    {
      id: "dsa-009",
      title: "Two Sum",
      difficulty: "Medium",
      tags: ["Array", "Hashing", "Two Pointers"],
      defaultScore: 20,
      description: `Given an array of N integers and a target, find two distinct indices i and j such that arr[i] + arr[j] == target.
Print the two indices separated by a space (smaller index first). Print "-1" if no solution exists.

Input format:
  Line 1: N
  Line 2: N space-separated integers
  Line 3: target

Output format:
  "i j" or "-1"

Example:
  Input:
    4
    2 7 11 15
    9
  Output:
    0 1`,
      testCases: [
        { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
        { input: "3\n3 2 4\n6", expectedOutput: "1 2", isHidden: false },
        { input: "4\n1 2 3 4\n10", expectedOutput: "-1", isHidden: true },
        { input: "5\n0 4 3 0 5\n0", expectedOutput: "0 3", isHidden: true },
      ],
    },
    {
      id: "dsa-010",
      title: "Valid Parentheses",
      difficulty: "Medium",
      tags: ["String", "Stack"],
      defaultScore: 20,
      description: `Given a string containing only '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
A string is valid if every opening bracket has a matching closing bracket in the correct order.

Input format:
  A single string

Output format:
  "true" or "false"

Example:
  Input:
    ({[]})
  Output:
    true`,
      testCases: [
        { input: "({[]})", expectedOutput: "true", isHidden: false },
        { input: "(]", expectedOutput: "false", isHidden: false },
        { input: "()[]{}", expectedOutput: "true", isHidden: true },
        { input: "{[}", expectedOutput: "false", isHidden: true },
        { input: "", expectedOutput: "true", isHidden: true },
      ],
    },
    {
      id: "dsa-011",
      title: "Find Missing Number",
      difficulty: "Medium",
      tags: ["Array", "Math", "Bit Manipulation"],
      defaultScore: 20,
      description: `Given an array of N distinct integers in the range [0, N], exactly one number is missing. Find it.

Input format:
  Line 1: N
  Line 2: N space-separated integers

Output format:
  The missing number

Example:
  Input:
    4
    3 0 1 4
  Output:
    2`,
      testCases: [
        { input: "4\n3 0 1 4", expectedOutput: "2", isHidden: false },
        { input: "3\n0 1 3", expectedOutput: "2", isHidden: false },
        { input: "1\n1", expectedOutput: "0", isHidden: true },
        { input: "5\n0 1 2 3 4", expectedOutput: "5", isHidden: true },
      ],
    },
    {
      id: "dsa-012",
      title: "Maximum Subarray Sum (Kadane's)",
      difficulty: "Medium",
      tags: ["Array", "Dynamic Programming", "Kadane's Algorithm"],
      defaultScore: 25,
      description: `Given an array of N integers, find the contiguous subarray with the largest sum and print that sum.

Input format:
  Line 1: N
  Line 2: N space-separated integers

Output format:
  A single integer — the maximum subarray sum

Example:
  Input:
    8
    -2 1 -3 4 -1 2 1 -5 4
  Output:
    6  (subarray [4,-1,2,1])`,
      testCases: [
        { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isHidden: false },
        { input: "4\n-1 -2 -3 -4", expectedOutput: "-1", isHidden: false },
        { input: "5\n1 2 3 4 5", expectedOutput: "15", isHidden: true },
        { input: "6\n5 -2 3 -1 2 -4", expectedOutput: "7", isHidden: true },
      ],
    },
    {
      id: "dsa-013",
      title: "Merge Two Sorted Arrays",
      difficulty: "Medium",
      tags: ["Array", "Two Pointers", "Sorting"],
      defaultScore: 20,
      description: `Given two sorted arrays, merge them into one sorted array and print the result.

Input format:
  Line 1: N1 (size of first array)
  Line 2: N1 space-separated integers (sorted)
  Line 3: N2 (size of second array)
  Line 4: N2 space-separated integers (sorted)

Output format:
  Merged sorted array, space-separated

Example:
  Input:
    3
    1 3 5
    4
    2 4 6 8
  Output:
    1 2 3 4 5 6 8`,
      testCases: [
        { input: "3\n1 3 5\n4\n2 4 6 8", expectedOutput: "1 2 3 4 5 6 8", isHidden: false },
        { input: "2\n1 2\n2\n3 4", expectedOutput: "1 2 3 4", isHidden: false },
        { input: "0\n\n3\n1 2 3", expectedOutput: "1 2 3", isHidden: true },
        { input: "3\n1 2 3\n3\n1 2 3", expectedOutput: "1 1 2 2 3 3", isHidden: true },
      ],
    },
    {
      id: "dsa-014",
      title: "Majority Element",
      difficulty: "Medium",
      tags: ["Array", "Boyer-Moore Voting"],
      defaultScore: 20,
      description: `Given an array of N integers, find the majority element — the element that appears more than N/2 times.
It is guaranteed that a majority element always exists.

Input format:
  Line 1: N
  Line 2: N space-separated integers

Output format:
  The majority element

Example:
  Input:
    7
    2 2 1 1 1 2 2
  Output:
    2`,
      testCases: [
        { input: "7\n2 2 1 1 1 2 2", expectedOutput: "2", isHidden: false },
        { input: "5\n3 2 3 1 3", expectedOutput: "3", isHidden: false },
        { input: "1\n5", expectedOutput: "5", isHidden: true },
        { input: "6\n1 1 2 1 3 1", expectedOutput: "1", isHidden: true },
      ],
    },
    {
      id: "dsa-015",
      title: "Check Anagram",
      difficulty: "Medium",
      tags: ["String", "Hashing"],
      defaultScore: 15,
      description: `Given two strings, determine if one is an anagram of the other (case-sensitive).
Two strings are anagrams if they contain the same characters in any order.

Input format:
  Line 1: first string
  Line 2: second string

Output format:
  "true" or "false"

Example:
  Input:
    listen
    silent
  Output:
    true`,
      testCases: [
        { input: "listen\nsilent", expectedOutput: "true", isHidden: false },
        { input: "hello\nworld", expectedOutput: "false", isHidden: false },
        { input: "abc\ncba", expectedOutput: "true", isHidden: true },
        { input: "aab\nbaa", expectedOutput: "true", isHidden: true },
        { input: "rat\ncar", expectedOutput: "false", isHidden: true },
      ],
    },
    {
      id: "dsa-016",
      title: "Sort 0s, 1s and 2s",
      difficulty: "Medium",
      tags: ["Array", "Dutch National Flag", "Two Pointers"],
      defaultScore: 20,
      description: `Given an array of N integers containing only 0s, 1s, and 2s, sort it in-place and print the result.
Do NOT use a sorting function — implement the Dutch National Flag algorithm.

Input format:
  Line 1: N
  Line 2: N space-separated integers (only 0, 1, 2)

Output format:
  Sorted array, space-separated

Example:
  Input:
    6
    2 0 2 1 1 0
  Output:
    0 0 1 1 2 2`,
      testCases: [
        { input: "6\n2 0 2 1 1 0", expectedOutput: "0 0 1 1 2 2", isHidden: false },
        { input: "3\n2 1 0", expectedOutput: "0 1 2", isHidden: false },
        { input: "4\n0 0 0 0", expectedOutput: "0 0 0 0", isHidden: true },
        { input: "5\n1 2 0 2 1", expectedOutput: "0 1 1 2 2", isHidden: true },
      ],
    },
    {
      id: "dsa-017",
      title: "Longest Common Prefix",
      difficulty: "Medium",
      tags: ["String", "Trie"],
      defaultScore: 20,
      description: `Given N strings, find the longest common prefix among all of them.
If there is no common prefix, print an empty string.

Input format:
  Line 1: N
  Lines 2..N+1: one string per line

Output format:
  The longest common prefix (or empty line if none)

Example:
  Input:
    3
    flower
    flow
    flight
  Output:
    fl`,
      testCases: [
        { input: "3\nflower\nflow\nflight", expectedOutput: "fl", isHidden: false },
        { input: "3\ndog\nracecar\ncar", expectedOutput: "", isHidden: false },
        { input: "2\ninterstellar\ninterface", expectedOutput: "inter", isHidden: true },
        { input: "1\nhello", expectedOutput: "hello", isHidden: true },
      ],
    },
    {
      id: "dsa-018",
      title: "Product of Array Except Self",
      difficulty: "Medium",
      tags: ["Array", "Prefix/Suffix Product"],
      defaultScore: 25,
      description: `Given an array of N integers, return an array where each element is the product of all elements except itself.
Do NOT use division.

Input format:
  Line 1: N
  Line 2: N space-separated integers

Output format:
  N space-separated integers

Example:
  Input:
    4
    1 2 3 4
  Output:
    24 12 8 6`,
      testCases: [
        { input: "4\n1 2 3 4", expectedOutput: "24 12 8 6", isHidden: false },
        { input: "3\n2 3 4", expectedOutput: "12 8 6", isHidden: false },
        { input: "4\n-1 1 0 -3", expectedOutput: "0 0 3 0", isHidden: true },
        { input: "2\n3 5", expectedOutput: "5 3", isHidden: true },
      ],
    },

    // ─── HARD ────────────────────────────────────────────────────────────────────
    {
      id: "dsa-019",
      title: "Trapping Rain Water",
      difficulty: "Hard",
      tags: ["Array", "Two Pointers", "Stack"],
      defaultScore: 35,
      description: `Given N non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.

Input format:
  Line 1: N
  Line 2: N space-separated non-negative integers

Output format:
  A single integer — total water trapped

Example:
  Input:
    12
    0 1 0 2 1 0 1 3 2 1 2 1
  Output:
    6`,
      testCases: [
        { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6", isHidden: false },
        { input: "6\n4 2 0 3 2 5", expectedOutput: "9", isHidden: false },
        { input: "3\n3 0 3", expectedOutput: "3", isHidden: true },
        { input: "4\n0 0 0 0", expectedOutput: "0", isHidden: true },
        { input: "5\n1 2 3 4 5", expectedOutput: "0", isHidden: true },
      ],
    },
    {
      id: "dsa-020",
      title: "Longest Palindromic Substring Length",
      difficulty: "Hard",
      tags: ["String", "Dynamic Programming", "Expand Around Center"],
      defaultScore: 35,
      description: `Given a string, find the length of the longest palindromic substring.

Input format:
  A single string (no spaces)

Output format:
  A single integer — the length of the longest palindromic substring

Example:
  Input:
    babad
  Output:
    3  (either "bab" or "aba")`,
      testCases: [
        { input: "babad", expectedOutput: "3", isHidden: false },
        { input: "cbbd", expectedOutput: "2", isHidden: false },
        { input: "a", expectedOutput: "1", isHidden: true },
        { input: "racecar", expectedOutput: "7", isHidden: true },
        { input: "abcba", expectedOutput: "5", isHidden: true },
      ],
    },
    {
      id: "dsa-021",
      title: "Rotate Array",
      difficulty: "Medium",
      tags: ["Array", "Two Pointers"],
      defaultScore: 20,
      description: `Given an array of N integers and a non-negative integer K, rotate the array to the right by K steps.

Input format:
  Line 1: N
  Line 2: N space-separated integers
  Line 3: K

Output format:
  Rotated array, space-separated

Example:
  Input:
    5
    1 2 3 4 5
    2
  Output:
    4 5 1 2 3`,
      testCases: [
        { input: "5\n1 2 3 4 5\n2", expectedOutput: "4 5 1 2 3", isHidden: false },
        { input: "3\n1 2 3\n4", expectedOutput: "3 1 2", isHidden: false },
        { input: "4\n1 2 3 4\n0", expectedOutput: "1 2 3 4", isHidden: true },
        { input: "6\n1 2 3 4 5 6\n6", expectedOutput: "1 2 3 4 5 6", isHidden: true },
      ],
    },
    {
      id: "dsa-022",
      title: "Power Function (Fast Exponentiation)",
      difficulty: "Medium",
      tags: ["Math", "Recursion", "Divide and Conquer"],
      defaultScore: 20,
      description: `Implement a fast power function: compute base^exponent without using built-in pow functions.
Use fast exponentiation (O(log n)).

Input format:
  Line 1: base (integer)
  Line 2: exponent (non-negative integer)

Output format:
  A single integer — base^exponent

Example:
  Input:
    2
    10
  Output:
    1024`,
      testCases: [
        { input: "2\n10", expectedOutput: "1024", isHidden: false },
        { input: "3\n4", expectedOutput: "81", isHidden: false },
        { input: "5\n0", expectedOutput: "1", isHidden: true },
        { input: "1\n100", expectedOutput: "1", isHidden: true },
        { input: "2\n15", expectedOutput: "32768", isHidden: true },
      ],
    },
    {
      id: "dsa-023",
      title: "Diagonal Sum of Matrix",
      difficulty: "Medium",
      tags: ["Matrix", "Array"],
      defaultScore: 20,
      description: `Given an N×N matrix, find the sum of both diagonals. If N is odd, the center element must be counted only once.

Input format:
  Line 1: N
  Lines 2..N+1: N space-separated integers per row

Output format:
  A single integer — the diagonal sum

Example:
  Input:
    3
    1 2 3
    4 5 6
    7 8 9
  Output:
    25`,
      testCases: [
        { input: "3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "25", isHidden: false },
        { input: "2\n1 2\n3 4", expectedOutput: "10", isHidden: false },
        { input: "1\n5", expectedOutput: "5", isHidden: true },
        { input: "4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16", expectedOutput: "68", isHidden: true },
      ],
    },
    {
      id: "dsa-024",
      title: "Next Greater Element",
      difficulty: "Medium",
      tags: ["Array", "Stack", "Monotonic Stack"],
      defaultScore: 25,
      description: `Given an array of N integers, for each element print the next greater element to its right. If no such element exists, print -1.

Input format:
  Line 1: N
  Line 2: N space-separated integers

Output format:
  N space-separated integers

Example:
  Input:
    5
    4 5 2 10 8
  Output:
    5 10 10 -1 -1`,
      testCases: [
        { input: "5\n4 5 2 10 8", expectedOutput: "5 10 10 -1 -1", isHidden: false },
        { input: "3\n3 2 1", expectedOutput: "-1 -1 -1", isHidden: false },
        { input: "4\n1 2 3 4", expectedOutput: "2 3 4 -1", isHidden: true },
        { input: "5\n6 8 0 1 3", expectedOutput: "8 -1 1 3 -1", isHidden: true },
      ],
    },
  ],
};

export const MATH_BANK: QuestionBank = {
  tag: "MATH",
  label: "Math & Number Theory",
  description: "Problems involving prime numbers, GCD, factorials, modular arithmetic, and combinatorics.",
  questions: [
    {
      id: "math-001",
      title: "Check Prime Number",
      difficulty: "Easy",
      tags: ["Math", "Number Theory"],
      defaultScore: 10,
      description: `Given a number N, determine whether it is prime.

Input format:
  A single integer N (N ≥ 2)

Output format:
  "true" if prime, "false" otherwise

Example:
  Input:
    7
  Output:
    true`,
      testCases: [
        { input: "7", expectedOutput: "true", isHidden: false },
        { input: "4", expectedOutput: "false", isHidden: false },
        { input: "2", expectedOutput: "true", isHidden: true },
        { input: "97", expectedOutput: "true", isHidden: true },
        { input: "100", expectedOutput: "false", isHidden: true },
      ],
    },
    {
      id: "math-002",
      title: "GCD and LCM",
      difficulty: "Easy",
      tags: ["Math", "Euclidean Algorithm"],
      defaultScore: 10,
      description: `Given two integers A and B, print their GCD on the first line and LCM on the second line.

Input format:
  Line 1: A
  Line 2: B

Output format:
  Line 1: GCD(A, B)
  Line 2: LCM(A, B)

Example:
  Input:
    12
    18
  Output:
    6
    36`,
      testCases: [
        { input: "12\n18", expectedOutput: "6\n36", isHidden: false },
        { input: "5\n7", expectedOutput: "1\n35", isHidden: false },
        { input: "100\n75", expectedOutput: "25\n300", isHidden: true },
        { input: "1\n1", expectedOutput: "1\n1", isHidden: true },
      ],
    },
    {
      id: "math-003",
      title: "Factorial",
      difficulty: "Easy",
      tags: ["Math", "Recursion"],
      defaultScore: 10,
      description: `Given N, compute N! (N factorial).

Input format:
  A single integer N (0 ≤ N ≤ 15)

Output format:
  A single integer — N!

Example:
  Input:
    5
  Output:
    120`,
      testCases: [
        { input: "5", expectedOutput: "120", isHidden: false },
        { input: "0", expectedOutput: "1", isHidden: false },
        { input: "10", expectedOutput: "3628800", isHidden: true },
        { input: "1", expectedOutput: "1", isHidden: true },
      ],
    },
    {
      id: "math-004",
      title: "Count Prime Factors",
      difficulty: "Medium",
      tags: ["Math", "Prime Factorization"],
      defaultScore: 20,
      description: `Given N, print all distinct prime factors of N in ascending order, space-separated.

Input format:
  A single integer N (N ≥ 2)

Output format:
  Distinct prime factors, space-separated, ascending

Example:
  Input:
    60
  Output:
    2 3 5`,
      testCases: [
        { input: "60", expectedOutput: "2 3 5", isHidden: false },
        { input: "13", expectedOutput: "13", isHidden: false },
        { input: "100", expectedOutput: "2 5", isHidden: true },
        { input: "360", expectedOutput: "2 3 5", isHidden: true },
      ],
    },
    {
      id: "math-005",
      title: "Sieve of Eratosthenes",
      difficulty: "Medium",
      tags: ["Math", "Sieve", "Number Theory"],
      defaultScore: 25,
      description: `Given N, print all prime numbers up to and including N using the Sieve of Eratosthenes, space-separated.

Input format:
  A single integer N

Output format:
  All primes ≤ N, space-separated in ascending order

Example:
  Input:
    20
  Output:
    2 3 5 7 11 13 17 19`,
      testCases: [
        { input: "20", expectedOutput: "2 3 5 7 11 13 17 19", isHidden: false },
        { input: "10", expectedOutput: "2 3 5 7", isHidden: false },
        { input: "2", expectedOutput: "2", isHidden: true },
        { input: "30", expectedOutput: "2 3 5 7 11 13 17 19 23 29", isHidden: true },
      ],
    },
    {
      id: "math-006",
      title: "Pascal's Triangle Row",
      difficulty: "Medium",
      tags: ["Math", "Combinatorics", "Dynamic Programming"],
      defaultScore: 20,
      description: `Given N (0-indexed row number), print the Nth row of Pascal's triangle, space-separated.

Input format:
  A single integer N (0 ≤ N ≤ 10)

Output format:
  N+1 space-separated integers

Example:
  Input:
    4
  Output:
    1 4 6 4 1`,
      testCases: [
        { input: "4", expectedOutput: "1 4 6 4 1", isHidden: false },
        { input: "0", expectedOutput: "1", isHidden: false },
        { input: "5", expectedOutput: "1 5 10 10 5 1", isHidden: true },
        { input: "1", expectedOutput: "1 1", isHidden: true },
      ],
    },
    {
      id: "math-007",
      title: "Armstrong Number",
      difficulty: "Easy",
      tags: ["Math"],
      defaultScore: 10,
      description: `A number is an Armstrong number if the sum of its digits each raised to the power of the number of digits equals the number itself.
Example: 153 = 1³ + 5³ + 3³ = 153.

Given N, print "true" if it is an Armstrong number, "false" otherwise.

Input format:
  A single positive integer N

Output format:
  "true" or "false"`,
      testCases: [
        { input: "153", expectedOutput: "true", isHidden: false },
        { input: "100", expectedOutput: "false", isHidden: false },
        { input: "370", expectedOutput: "true", isHidden: true },
        { input: "1", expectedOutput: "true", isHidden: true },
        { input: "9474", expectedOutput: "true", isHidden: true },
      ],
    },
    {
      id: "math-008",
      title: "Matrix Multiplication",
      difficulty: "Hard",
      tags: ["Math", "Matrix", "Linear Algebra"],
      defaultScore: 30,
      description: `Given two N×N matrices A and B, compute their product C = A × B and print the result row by row.

Input format:
  Line 1: N
  Lines 2 to N+1: N space-separated integers (matrix A, row by row)
  Lines N+2 to 2N+1: N space-separated integers (matrix B, row by row)

Output format:
  N rows, each with N space-separated integers

Example:
  Input:
    2
    1 2
    3 4
    5 6
    7 8
  Output:
    19 22
    43 50`,
      testCases: [
        { input: "2\n1 2\n3 4\n5 6\n7 8", expectedOutput: "19 22\n43 50", isHidden: false },
        { input: "2\n1 0\n0 1\n3 4\n5 6", expectedOutput: "3 4\n5 6", isHidden: false },
        { input: "3\n1 2 3\n4 5 6\n7 8 9\n9 8 7\n6 5 4\n3 2 1", expectedOutput: "30 24 18\n84 69 54\n138 114 90", isHidden: true },
      ],
    },
  ],
};

export const STRINGS_BANK: QuestionBank = {
  tag: "STRINGS",
  label: "String Processing",
  description: "Problems focused on string manipulation, pattern matching, and text processing.",
  questions: [
    {
      id: "str-001",
      title: "Reverse Words in a Sentence",
      difficulty: "Easy",
      tags: ["String"],
      defaultScore: 10,
      description: `Given a sentence, reverse the order of the words (not the characters in each word).

Input format:
  A single line of text

Output format:
  Words in reverse order, single-space separated

Example:
  Input:
    Hello World How Are You
  Output:
    You Are How World Hello`,
      testCases: [
        { input: "Hello World How Are You", expectedOutput: "You Are How World Hello", isHidden: false },
        { input: "one", expectedOutput: "one", isHidden: false },
        { input: "the sky is blue", expectedOutput: "blue is sky the", isHidden: true },
        { input: "a good example", expectedOutput: "example good a", isHidden: true },
      ],
    },
    {
      id: "str-002",
      title: "Count Vowels and Consonants",
      difficulty: "Easy",
      tags: ["String", "Character Processing"],
      defaultScore: 10,
      description: `Given a string of lowercase letters, count the number of vowels and consonants.

Input format:
  A single lowercase string (no spaces)

Output format:
  Line 1: number of vowels
  Line 2: number of consonants

Example:
  Input:
    programming
  Output:
    3
    8`,
      testCases: [
        { input: "programming", expectedOutput: "3\n8", isHidden: false },
        { input: "aeiou", expectedOutput: "5\n0", isHidden: false },
        { input: "rhythm", expectedOutput: "0\n6", isHidden: true },
        { input: "education", expectedOutput: "5\n4", isHidden: true },
      ],
    },
    {
      id: "str-003",
      title: "Caesar Cipher",
      difficulty: "Easy",
      tags: ["String", "Cryptography"],
      defaultScore: 15,
      description: `Given a string and a shift K, encrypt it using Caesar Cipher (shift each letter by K positions, wrap around, preserve case, keep non-letters unchanged).

Input format:
  Line 1: the string
  Line 2: K (integer, may be negative)

Output format:
  The encrypted string

Example:
  Input:
    Hello World
    3
  Output:
    Khoor Zruog`,
      testCases: [
        { input: "Hello World\n3", expectedOutput: "Khoor Zruog", isHidden: false },
        { input: "abc\n1", expectedOutput: "bcd", isHidden: false },
        { input: "xyz\n3", expectedOutput: "abc", isHidden: true },
        { input: "Attack at Dawn\n13", expectedOutput: "Nggnpx ng Qnja", isHidden: true },
      ],
    },
    {
      id: "str-004",
      title: "Run-Length Encoding",
      difficulty: "Medium",
      tags: ["String", "Compression"],
      defaultScore: 20,
      description: `Implement Run-Length Encoding (RLE): compress a string by replacing consecutive repeated characters with the character followed by its count (only if count > 1).

Input format:
  A single string (lowercase letters only)

Output format:
  The RLE-compressed string

Example:
  Input:
    aaabbbccddddee
  Output:
    a3b3c2d4e2`,
      testCases: [
        { input: "aaabbbccddddee", expectedOutput: "a3b3c2d4e2", isHidden: false },
        { input: "abcd", expectedOutput: "abcd", isHidden: false },
        { input: "aaa", expectedOutput: "a3", isHidden: true },
        { input: "aabbaa", expectedOutput: "a2b2a2", isHidden: true },
      ],
    },
    {
      id: "str-005",
      title: "Count Words in a String",
      difficulty: "Easy",
      tags: ["String"],
      defaultScore: 10,
      description: `Given a sentence, count the number of words (words are separated by one or more spaces).

Input format:
  A single line of text

Output format:
  A single integer — word count

Example:
  Input:
    the quick brown fox
  Output:
    4`,
      testCases: [
        { input: "the quick brown fox", expectedOutput: "4", isHidden: false },
        { input: "hello", expectedOutput: "1", isHidden: false },
        { input: "one two  three", expectedOutput: "3", isHidden: true },
        { input: "a b c d e", expectedOutput: "5", isHidden: true },
      ],
    },
    {
      id: "str-006",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      tags: ["String", "Sliding Window", "Hashing"],
      defaultScore: 25,
      description: `Given a string, find the length of the longest substring without repeating characters.

Input format:
  A single string (lowercase letters, no spaces)

Output format:
  A single integer — the length

Example:
  Input:
    abcabcbb
  Output:
    3  (substring "abc")`,
      testCases: [
        { input: "abcabcbb", expectedOutput: "3", isHidden: false },
        { input: "bbbbb", expectedOutput: "1", isHidden: false },
        { input: "pwwkew", expectedOutput: "3", isHidden: true },
        { input: "abcdef", expectedOutput: "6", isHidden: true },
        { input: "dvdf", expectedOutput: "3", isHidden: true },
      ],
    },
    {
      id: "str-007",
      title: "String Compression Check",
      difficulty: "Medium",
      tags: ["String", "Two Pointers"],
      defaultScore: 20,
      description: `Given two strings S and T, check if S can be obtained by deleting some (possibly zero) characters from T without reordering the remaining characters. (i.e., is S a subsequence of T?)

Input format:
  Line 1: S
  Line 2: T

Output format:
  "true" or "false"

Example:
  Input:
    ace
    abcde
  Output:
    true`,
      testCases: [
        { input: "ace\nabcde", expectedOutput: "true", isHidden: false },
        { input: "axc\nahbgdc", expectedOutput: "false", isHidden: false },
        { input: "abc\nabc", expectedOutput: "true", isHidden: true },
        { input: "\nhello", expectedOutput: "true", isHidden: true },
        { input: "hello\nhlo", expectedOutput: "false", isHidden: true },
      ],
    },
    {
      id: "str-008",
      title: "Roman to Integer",
      difficulty: "Medium",
      tags: ["String", "Math"],
      defaultScore: 20,
      description: `Given a Roman numeral string, convert it to an integer.
Roman numerals: I=1, V=5, X=10, L=50, C=100, D=500, M=1000
Subtraction rule applies: IV=4, IX=9, XL=40, XC=90, CD=400, CM=900.

Input format:
  A single Roman numeral string (uppercase)

Output format:
  A single integer

Example:
  Input:
    MCMXCIV
  Output:
    1994`,
      testCases: [
        { input: "MCMXCIV", expectedOutput: "1994", isHidden: false },
        { input: "III", expectedOutput: "3", isHidden: false },
        { input: "IX", expectedOutput: "9", isHidden: true },
        { input: "LVIII", expectedOutput: "58", isHidden: true },
        { input: "MMXXIV", expectedOutput: "2024", isHidden: true },
      ],
    },
  ],
};

export const QUESTION_BANKS: QuestionBank[] = [DSA_BANK, MATH_BANK, STRINGS_BANK];
