import { PrismaClient, BankDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

const banks = [
  // ─────────────────────────────────────────────────────────────
  // DSA — 11 questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'DSA',
    label: 'Data Structures & Algorithms',
    description: 'Classic DSA problems covering arrays, strings, searching, sorting, and more.',
    questions: [
      {
        title: 'Find Maximum Element', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Array', 'Linear Scan'],
        functionName: 'findMaximumElement',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number',
        description: `Given an array of N integers, find and print the maximum element.\n\nParameters:\n  arr — array of integers\n\nReturns:\n  A single integer — the maximum element\n\nExample:\n  findMaximumElement([3,7,1,9,4]) → 9`,
        testCases: [
          { input: '[[3,7,1,9,4]]', expectedOutput: '9', isHidden: false },
          { input: '[[-1,-5,-2,-8]]', expectedOutput: '-1', isHidden: false },
          { input: '[[42]]', expectedOutput: '42', isHidden: true },
          { input: '[[100,200,150,300,250,50]]', expectedOutput: '300', isHidden: true },
        ],
      },
      {
        title: 'Sum of Array', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Array', 'Linear Scan'],
        functionName: 'sumOfArray',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number',
        description: `Given an array of N integers, compute and print their sum.\n\nParameters:\n  arr — array of integers\n\nReturns:\n  A single integer — the sum`,
        testCases: [
          { input: '[[1,2,3,4]]', expectedOutput: '10', isHidden: false },
          { input: '[[-1,5,-4]]', expectedOutput: '0', isHidden: false },
          { input: '[[0]]', expectedOutput: '0', isHidden: true },
          { input: '[[10,20,30,40,50]]', expectedOutput: '150', isHidden: true },
        ],
      },
      {
        title: 'Reverse an Array', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Array', 'Two Pointers'],
        functionName: 'reverseArray',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number[]',
        description: `Given an array of N integers, print the array in reverse order.\n\nParameters:\n  arr — array of integers\n\nReturns:\n  The array reversed`,
        testCases: [
          { input: '[[1,2,3,4,5]]', expectedOutput: '5 4 3 2 1', isHidden: false },
          { input: '[[7,8,9]]', expectedOutput: '9 8 7', isHidden: false },
          { input: '[[42]]', expectedOutput: '42', isHidden: true },
          { input: '[[-3,0,5,-1]]', expectedOutput: '-1 5 0 -3', isHidden: true },
        ],
      },
      {
        title: 'Check Palindrome', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['String', 'Two Pointers'],
        functionName: 'checkPalindrome',
        parameters: [{ name: 's', type: 'string' }],
        returnType: 'boolean',
        description: `Given a string, determine whether it is a palindrome.\n\nParameters:\n  s — the input string\n\nReturns:\n  true if palindrome, false otherwise`,
        testCases: [
          { input: '["racecar"]', expectedOutput: 'true', isHidden: false },
          { input: '["hello"]', expectedOutput: 'false', isHidden: false },
          { input: '["madam"]', expectedOutput: 'true', isHidden: true },
          { input: '["OpenAI"]', expectedOutput: 'false', isHidden: true },
        ],
      },
      {
        title: 'Fibonacci Number', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Math', 'Dynamic Programming'],
        functionName: 'fibonacci',
        parameters: [{ name: 'n', type: 'number' }],
        returnType: 'number',
        description: `Given N, print the Nth Fibonacci number (0-indexed).\nF(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)\n\nParameters:\n  n — a non-negative integer (0 ≤ n ≤ 40)\n\nReturns:\n  A single integer — F(n)`,
        testCases: [
          { input: '[6]', expectedOutput: '8', isHidden: false },
          { input: '[0]', expectedOutput: '0', isHidden: false },
          { input: '[10]', expectedOutput: '55', isHidden: true },
          { input: '[15]', expectedOutput: '610', isHidden: true },
        ],
      },
      {
        title: 'Binary Search', difficulty: BankDifficulty.Easy, defaultScore: 15,
        tags: ['Array', 'Binary Search', 'Searching'],
        functionName: 'binarySearch',
        parameters: [{ name: 'arr', type: 'number[]' }, { name: 'target', type: 'number' }],
        returnType: 'number',
        description: `Given a sorted array of N integers and a target, return the 0-based index of the target, or -1 if not found.\n\nParameters:\n  arr    — sorted array of integers (ascending)\n  target — the value to find\n\nReturns:\n  0-based index of target, or -1 if not found`,
        testCases: [
          { input: '[[1,3,5,7,9],7]', expectedOutput: '3', isHidden: false },
          { input: '[[1,3,5,7,9],6]', expectedOutput: '-1', isHidden: false },
          { input: '[[2,4,6,8,10,12],2]', expectedOutput: '0', isHidden: true },
          { input: '[[2,4,6,8,10,12],12]', expectedOutput: '5', isHidden: true },
        ],
      },
      {
        title: 'Two Sum', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['Array', 'Hashing', 'Two Pointers'],
        functionName: 'twoSum',
        parameters: [{ name: 'arr', type: 'number[]' }, { name: 'target', type: 'number' }],
        returnType: 'string',
        description: `Given an array of N integers and a target, find two distinct indices i and j such that arr[i]+arr[j]==target.\nReturn "i j" (smaller index first) or "-1" if no solution.\n\nParameters:\n  arr    — array of integers\n  target — the target sum\n\nReturns:\n  "i j" or "-1"`,
        testCases: [
          { input: '[[2,7,11,15],9]', expectedOutput: '0 1', isHidden: false },
          { input: '[[3,2,4],6]', expectedOutput: '1 2', isHidden: false },
          { input: '[[1,2,3,4],10]', expectedOutput: '-1', isHidden: true },
          { input: '[[0,4,3,0,5],0]', expectedOutput: '0 3', isHidden: true },
        ],
      },
      {
        title: 'Valid Parentheses', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['String', 'Stack'],
        functionName: 'validParentheses',
        parameters: [{ name: 's', type: 'string' }],
        returnType: 'boolean',
        description: `Given a string of brackets, determine if it is valid.\n\nParameters:\n  s — string containing only brackets\n\nReturns:\n  true if valid, false otherwise`,
        testCases: [
          { input: '["({[]})"]', expectedOutput: 'true', isHidden: false },
          { input: '["(]"]', expectedOutput: 'false', isHidden: false },
          { input: '["()[]{}"]', expectedOutput: 'true', isHidden: true },
          { input: '["{[}"]', expectedOutput: 'false', isHidden: true },
        ],
      },
      {
        title: "Maximum Subarray Sum (Kadane's)", difficulty: BankDifficulty.Medium, defaultScore: 25,
        tags: ['Array', 'Dynamic Programming', "Kadane's Algorithm"],
        functionName: 'maximumSubarraySum',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number',
        description: `Given an array of N integers, find the contiguous subarray with the largest sum.\n\nParameters:\n  arr — array of integers\n\nReturns:\n  A single integer — the maximum subarray sum`,
        testCases: [
          { input: '[[-2,1,-3,4,-1,2,1,-5,4]]', expectedOutput: '6', isHidden: false },
          { input: '[[-1,-2,-3,-4]]', expectedOutput: '-1', isHidden: false },
          { input: '[[1,2,3,4,5]]', expectedOutput: '15', isHidden: true },
          { input: '[[5,-2,3,-1,2,-4]]', expectedOutput: '7', isHidden: true },
        ],
      },
      {
        title: 'Find Missing Number', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['Array', 'Math', 'Bit Manipulation'],
        functionName: 'findMissingNumber',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number',
        description: `Given an array of N distinct integers in the range [0, N], one number is missing. Find it.\n\nParameters:\n  arr — array of N distinct integers in range [0, N]\n\nReturns:\n  The missing number`,
        testCases: [
          { input: '[[3,0,1,4]]', expectedOutput: '2', isHidden: false },
          { input: '[[0,1,3]]', expectedOutput: '2', isHidden: false },
          { input: '[[1]]', expectedOutput: '0', isHidden: true },
          { input: '[[0,1,2,3,4]]', expectedOutput: '5', isHidden: true },
        ],
      },
      {
        title: 'Trapping Rain Water', difficulty: BankDifficulty.Hard, defaultScore: 35,
        tags: ['Array', 'Two Pointers', 'Stack'],
        functionName: 'trappingRainWater',
        parameters: [{ name: 'height', type: 'number[]' }],
        returnType: 'number',
        description: `Given N non-negative integers representing elevation, compute how much water can be trapped.\n\nParameters:\n  height — array of non-negative integers (elevation map)\n\nReturns:\n  Total units of water trapped`,
        testCases: [
          { input: '[[0,1,0,2,1,0,1,3,2,1,2,1]]', expectedOutput: '6', isHidden: false },
          { input: '[[4,2,0,3,2,5]]', expectedOutput: '9', isHidden: false },
          { input: '[[3,0,3]]', expectedOutput: '3', isHidden: true },
          { input: '[[1,2,3,4,5]]', expectedOutput: '0', isHidden: true },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // MATH — 7 questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'MATH',
    label: 'Math & Number Theory',
    description: 'Problems involving prime numbers, GCD, factorials, modular arithmetic, and combinatorics.',
    questions: [
      {
        title: 'Check Prime Number', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Math', 'Number Theory'],
        functionName: 'checkPrime',
        parameters: [{ name: 'n', type: 'number' }],
        returnType: 'boolean',
        description: `Given N, determine whether it is prime.\n\nParameters:\n  n — an integer (n ≥ 2)\n\nReturns:\n  true if prime, false otherwise`,
        testCases: [
          { input: '[7]', expectedOutput: 'true', isHidden: false },
          { input: '[4]', expectedOutput: 'false', isHidden: false },
          { input: '[97]', expectedOutput: 'true', isHidden: true },
          { input: '[100]', expectedOutput: 'false', isHidden: true },
        ],
      },
      {
        title: 'GCD and LCM', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Math', 'Euclidean Algorithm'],
        functionName: 'gcdAndLcm',
        parameters: [{ name: 'a', type: 'number' }, { name: 'b', type: 'number' }],
        returnType: 'string',
        description: `Given two integers A and B, print GCD on line 1 and LCM on line 2.\n\nParameters:\n  a — first integer\n  b — second integer\n\nReturns:\n  GCD(a,b) on line 1, LCM(a,b) on line 2`,
        testCases: [
          { input: '[12,18]', expectedOutput: '6\n36', isHidden: false },
          { input: '[5,7]', expectedOutput: '1\n35', isHidden: false },
          { input: '[100,75]', expectedOutput: '25\n300', isHidden: true },
        ],
      },
      {
        title: 'Factorial', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Math', 'Recursion'],
        functionName: 'factorial',
        parameters: [{ name: 'n', type: 'number' }],
        returnType: 'number',
        description: `Given N, compute N! (N factorial).\n\nParameters:\n  n — a non-negative integer (0 ≤ n ≤ 15)\n\nReturns:\n  A single integer — n!`,
        testCases: [
          { input: '[5]', expectedOutput: '120', isHidden: false },
          { input: '[0]', expectedOutput: '1', isHidden: false },
          { input: '[10]', expectedOutput: '3628800', isHidden: true },
        ],
      },
      {
        title: 'Sieve of Eratosthenes', difficulty: BankDifficulty.Medium, defaultScore: 25,
        tags: ['Math', 'Sieve', 'Number Theory'],
        functionName: 'sieveOfEratosthenes',
        parameters: [{ name: 'n', type: 'number' }],
        returnType: 'number[]',
        description: `Given N, print all prime numbers up to N using the Sieve of Eratosthenes.\n\nParameters:\n  n — upper bound integer\n\nReturns:\n  All primes ≤ n, space-separated ascending`,
        testCases: [
          { input: '[20]', expectedOutput: '2 3 5 7 11 13 17 19', isHidden: false },
          { input: '[10]', expectedOutput: '2 3 5 7', isHidden: false },
          { input: '[30]', expectedOutput: '2 3 5 7 11 13 17 19 23 29', isHidden: true },
        ],
      },
      {
        title: 'Armstrong Number', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Math'],
        functionName: 'armstrongNumber',
        parameters: [{ name: 'n', type: 'number' }],
        returnType: 'boolean',
        description: `A number is Armstrong if the sum of its digits each raised to the number-of-digits power equals itself.\n153 = 1³+5³+3³ = 153.\n\nParameters:\n  n — a positive integer\n\nReturns:\n  true if Armstrong number, false otherwise`,
        testCases: [
          { input: '[153]', expectedOutput: 'true', isHidden: false },
          { input: '[100]', expectedOutput: 'false', isHidden: false },
          { input: '[370]', expectedOutput: 'true', isHidden: true },
          { input: '[9474]', expectedOutput: 'true', isHidden: true },
        ],
      },
      {
        title: 'Power Modulo', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['Math', 'Modular Arithmetic', 'Fast Exponentiation'],
        functionName: 'powerModulo',
        parameters: [{ name: 'base', type: 'number' }, { name: 'exp', type: 'number' }, { name: 'mod', type: 'number' }],
        returnType: 'number',
        description: `Compute (base^exp) % mod efficiently.\n\nParameters:\n  base — the base integer\n  exp  — the exponent (non-negative)\n  mod  — the modulus\n\nReturns:\n  A single integer — (base^exp) % mod`,
        testCases: [
          { input: '[2,10,1000]', expectedOutput: '24', isHidden: false },
          { input: '[3,5,13]', expectedOutput: '9', isHidden: false },
          { input: '[7,0,100]', expectedOutput: '1', isHidden: true },
          { input: '[2,30,1000000007]', expectedOutput: '1073741824', isHidden: true },
        ],
      },
      {
        title: 'Count Digits', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Math'],
        functionName: 'countDigits',
        parameters: [{ name: 'n', type: 'number' }],
        returnType: 'number',
        description: `Given N, count how many digits in N divide N evenly.\n\nParameters:\n  n — a positive integer (no zeros in digits)\n\nReturns:\n  Count of digits that divide n evenly`,
        testCases: [
          { input: '[1012]', expectedOutput: '3', isHidden: false },
          { input: '[7]', expectedOutput: '1', isHidden: false },
          { input: '[123]', expectedOutput: '2', isHidden: true },
          { input: '[248]', expectedOutput: '3', isHidden: true },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // STRINGS — 8 questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'STRINGS',
    label: 'String Processing',
    description: 'Problems focused on string manipulation, pattern matching, and text processing.',
    questions: [
      {
        title: 'Reverse Words in a Sentence', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['String'],
        functionName: 'reverseWords',
        parameters: [{ name: 'sentence', type: 'string' }],
        returnType: 'string',
        description: `Given a sentence, reverse the order of the words.\n\nParameters:\n  sentence — a sentence string\n\nReturns:\n  Words in reverse order, single-space separated`,
        testCases: [
          { input: '["Hello World How Are You"]', expectedOutput: 'You Are How World Hello', isHidden: false },
          { input: '["one"]', expectedOutput: 'one', isHidden: false },
          { input: '["the sky is blue"]', expectedOutput: 'blue is sky the', isHidden: true },
        ],
      },
      {
        title: 'Count Vowels and Consonants', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['String', 'Character Processing'],
        functionName: 'countVowelsAndConsonants',
        parameters: [{ name: 's', type: 'string' }],
        returnType: 'string',
        description: `Given a lowercase string, count vowels and consonants.\n\nParameters:\n  s — a lowercase string (no spaces)\n\nReturns:\n  Vowel count on line 1, consonant count on line 2`,
        testCases: [
          { input: '["programming"]', expectedOutput: '3\n8', isHidden: false },
          { input: '["aeiou"]', expectedOutput: '5\n0', isHidden: false },
          { input: '["education"]', expectedOutput: '5\n4', isHidden: true },
        ],
      },
      {
        title: 'Longest Substring Without Repeating Characters', difficulty: BankDifficulty.Medium, defaultScore: 25,
        tags: ['String', 'Sliding Window', 'Hashing'],
        functionName: 'longestSubstringWithoutRepeating',
        parameters: [{ name: 's', type: 'string' }],
        returnType: 'number',
        description: `Given a string, find the length of the longest substring without repeating characters.\n\nParameters:\n  s — a string of lowercase letters\n\nReturns:\n  A single integer — the length`,
        testCases: [
          { input: '["abcabcbb"]', expectedOutput: '3', isHidden: false },
          { input: '["bbbbb"]', expectedOutput: '1', isHidden: false },
          { input: '["pwwkew"]', expectedOutput: '3', isHidden: true },
          { input: '["dvdf"]', expectedOutput: '3', isHidden: true },
        ],
      },
      {
        title: 'Roman to Integer', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['String', 'Math'],
        functionName: 'romanToInteger',
        parameters: [{ name: 's', type: 'string' }],
        returnType: 'number',
        description: `Convert a Roman numeral string to an integer.\nI=1 V=5 X=10 L=50 C=100 D=500 M=1000. Subtraction rule applies.\n\nParameters:\n  s — a Roman numeral string (uppercase)\n\nReturns:\n  A single integer`,
        testCases: [
          { input: '["MCMXCIV"]', expectedOutput: '1994', isHidden: false },
          { input: '["III"]', expectedOutput: '3', isHidden: false },
          { input: '["LVIII"]', expectedOutput: '58', isHidden: true },
          { input: '["MMXXIV"]', expectedOutput: '2024', isHidden: true },
        ],
      },
      {
        title: 'Run-Length Encoding', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['String', 'Compression'],
        functionName: 'runLengthEncoding',
        parameters: [{ name: 's', type: 'string' }],
        returnType: 'string',
        description: `Compress a string using RLE: replace consecutive repeated chars with char+count (only if count > 1).\n\nParameters:\n  s — a string of lowercase letters\n\nReturns:\n  The RLE-compressed string`,
        testCases: [
          { input: '["aaabbbccddddee"]', expectedOutput: 'a3b3c2d4e2', isHidden: false },
          { input: '["abcd"]', expectedOutput: 'abcd', isHidden: false },
          { input: '["aabbaa"]', expectedOutput: 'a2b2a2', isHidden: true },
        ],
      },
      {
        title: 'Anagram Check', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['String', 'Hashing'],
        functionName: 'anagramCheck',
        parameters: [{ name: 'a', type: 'string' }, { name: 'b', type: 'string' }],
        returnType: 'boolean',
        description: `Given two strings, determine whether they are anagrams of each other (same characters, same frequencies, different order).\n\nParameters:\n  a — first string\n  b — second string\n\nReturns:\n  true if anagrams, false otherwise`,
        testCases: [
          { input: '["listen","silent"]', expectedOutput: 'true', isHidden: false },
          { input: '["hello","world"]', expectedOutput: 'false', isHidden: false },
          { input: '["triangle","integral"]', expectedOutput: 'true', isHidden: true },
          { input: '["abc","abcd"]', expectedOutput: 'false', isHidden: true },
        ],
      },
      {
        title: 'First Non-Repeating Character', difficulty: BankDifficulty.Easy, defaultScore: 15,
        tags: ['String', 'Hashing'],
        functionName: 'firstNonRepeatingChar',
        parameters: [{ name: 's', type: 'string' }],
        returnType: 'string',
        description: `Given a string, find the first character that appears exactly once. Print the character, or "-1" if none exists.\n\nParameters:\n  s — a lowercase string\n\nReturns:\n  The first non-repeating character, or "-1"`,
        testCases: [
          { input: '["leetcode"]', expectedOutput: 'l', isHidden: false },
          { input: '["aabb"]', expectedOutput: '-1', isHidden: false },
          { input: '["loveleetcode"]', expectedOutput: 'v', isHidden: true },
          { input: '["aabbcc"]', expectedOutput: '-1', isHidden: true },
        ],
      },
      {
        title: 'Minimum Window Substring Length', difficulty: BankDifficulty.Hard, defaultScore: 35,
        tags: ['String', 'Sliding Window', 'Hashing'],
        functionName: 'minimumWindowSubstringLength',
        parameters: [{ name: 's', type: 'string' }, { name: 't', type: 'string' }],
        returnType: 'number',
        description: `Given strings S and T, find the length of the minimum window in S that contains all characters of T. Print -1 if no such window exists.\n\nParameters:\n  s — the source string\n  t — the pattern string\n\nReturns:\n  Length of minimum window containing all chars of t, or -1`,
        testCases: [
          { input: '["ADOBECODEBANC","ABC"]', expectedOutput: '4', isHidden: false },
          { input: '["a","a"]', expectedOutput: '1', isHidden: false },
          { input: '["a","b"]', expectedOutput: '-1', isHidden: true },
          { input: '["cabwefgewcwaefgcf","cae"]', expectedOutput: '4', isHidden: true },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // GRAPHS — 6 questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'GRAPHS',
    label: 'Graph Theory',
    description: 'Graph traversal, shortest paths, connectivity, and cycle detection problems.',
    questions: [
      {
        title: 'BFS Level Order', difficulty: BankDifficulty.Easy, defaultScore: 15,
        tags: ['Graph', 'BFS', 'Queue'],
        functionName: 'bfsLevelOrder',
        parameters: [{ name: 'n', type: 'number' }, { name: 'edges', type: 'number[][]' }],
        returnType: 'number[]',
        description: `Given an undirected graph with N nodes (0-indexed) and E edges, print nodes in BFS order starting from node 0.\n\nParameters:\n  n     — number of nodes (0-indexed)\n  edges — array of [u, v] undirected edge pairs\n\nReturns:\n  Node indices in BFS visit order from node 0`,
        testCases: [
          { input: '[5,[[0,1],[0,2],[1,3],[2,4]]]', expectedOutput: '0 1 2 3 4', isHidden: false },
          { input: '[4,[[0,1],[0,2],[0,3]]]', expectedOutput: '0 1 2 3', isHidden: false },
          { input: '[3,[[0,1],[1,2]]]', expectedOutput: '0 1 2', isHidden: true },
          { input: '[6,[[0,1],[0,2],[1,3],[1,4],[2,5]]]', expectedOutput: '0 1 2 3 4 5', isHidden: true },
        ],
      },
      {
        title: 'DFS Traversal', difficulty: BankDifficulty.Easy, defaultScore: 15,
        tags: ['Graph', 'DFS', 'Stack', 'Recursion'],
        functionName: 'dfsTraversal',
        parameters: [{ name: 'n', type: 'number' }, { name: 'edges', type: 'number[][]' }],
        returnType: 'number[]',
        description: `Given an undirected graph with N nodes (0-indexed) and E edges, print nodes in DFS order starting from node 0. Visit neighbors in ascending order.\n\nParameters:\n  n     — number of nodes (0-indexed)\n  edges — array of [u, v] undirected edge pairs\n\nReturns:\n  Node indices in DFS visit order from node 0`,
        testCases: [
          { input: '[5,[[0,1],[0,2],[1,3],[2,4]]]', expectedOutput: '0 1 3 2 4', isHidden: false },
          { input: '[4,[[0,1],[0,2],[0,3]]]', expectedOutput: '0 1 2 3', isHidden: false },
          { input: '[3,[[0,1],[1,2]]]', expectedOutput: '0 1 2', isHidden: true },
        ],
      },
      {
        title: 'Count Connected Components', difficulty: BankDifficulty.Easy, defaultScore: 15,
        tags: ['Graph', 'BFS', 'DFS', 'Union-Find'],
        functionName: 'countConnectedComponents',
        parameters: [{ name: 'n', type: 'number' }, { name: 'edges', type: 'number[][]' }],
        returnType: 'number',
        description: `Given an undirected graph with N nodes and E edges, count the number of connected components.\n\nParameters:\n  n     — number of nodes (0-indexed)\n  edges — array of [u, v] undirected edge pairs\n\nReturns:\n  A single integer — the number of connected components`,
        testCases: [
          { input: '[5,[[0,1],[1,2],[3,4]]]', expectedOutput: '2', isHidden: false },
          { input: '[4,[]]', expectedOutput: '4', isHidden: false },
          { input: '[6,[[0,1],[1,2],[3,4],[4,5]]]', expectedOutput: '2', isHidden: true },
          { input: '[5,[[0,1],[1,2],[2,3],[3,4]]]', expectedOutput: '1', isHidden: true },
        ],
      },
      {
        title: 'Shortest Path (BFS)', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['Graph', 'BFS', 'Shortest Path'],
        functionName: 'shortestPath',
        parameters: [{ name: 'n', type: 'number' }, { name: 'edges', type: 'number[][]' }, { name: 'src', type: 'number' }, { name: 'dst', type: 'number' }],
        returnType: 'number',
        description: `Given an unweighted undirected graph and source/destination nodes, find the shortest path length. Print -1 if unreachable.\n\nParameters:\n  n     — number of nodes (0-indexed)\n  edges — array of [u, v] undirected edge pairs\n  src   — source node\n  dst   — destination node\n\nReturns:\n  The shortest path length, or -1 if unreachable`,
        testCases: [
          { input: '[6,[[0,1],[0,2],[1,3],[2,3],[3,4],[4,5],[2,5]],0,5]', expectedOutput: '3', isHidden: false },
          { input: '[3,[[0,1]],0,2]', expectedOutput: '-1', isHidden: false },
          { input: '[4,[[0,1],[1,2],[2,3],[0,3]],0,3]', expectedOutput: '1', isHidden: true },
        ],
      },
      {
        title: 'Detect Cycle in Undirected Graph', difficulty: BankDifficulty.Medium, defaultScore: 25,
        tags: ['Graph', 'DFS', 'Union-Find', 'Cycle Detection'],
        functionName: 'detectCycle',
        parameters: [{ name: 'n', type: 'number' }, { name: 'edges', type: 'number[][]' }],
        returnType: 'boolean',
        description: `Given an undirected graph with N nodes and E edges, detect if a cycle exists.\n\nParameters:\n  n     — number of nodes (0-indexed)\n  edges — array of [u, v] undirected edge pairs\n\nReturns:\n  true if a cycle exists, false otherwise`,
        testCases: [
          { input: '[4,[[0,1],[1,2],[2,3],[3,0]]]', expectedOutput: 'true', isHidden: false },
          { input: '[4,[[0,1],[1,2],[2,3]]]', expectedOutput: 'false', isHidden: false },
          { input: '[3,[[0,1],[1,2],[0,2]]]', expectedOutput: 'true', isHidden: true },
          { input: '[5,[[0,1],[0,2],[1,3],[2,4]]]', expectedOutput: 'false', isHidden: true },
        ],
      },
      {
        title: 'Topological Sort', difficulty: BankDifficulty.Hard, defaultScore: 35,
        tags: ['Graph', 'DAG', 'DFS', 'Topological Sort'],
        functionName: 'topologicalSort',
        parameters: [{ name: 'n', type: 'number' }, { name: 'edges', type: 'number[][]' }],
        returnType: 'number[]',
        description: `Given a Directed Acyclic Graph (DAG) with N nodes (0-indexed) and E directed edges, print one valid topological ordering.\n\nParameters:\n  n     — number of nodes (0-indexed)\n  edges — array of [u, v] directed edge pairs (u → v)\n\nReturns:\n  Node indices in topological order (lexicographically smallest if multiple valid orderings exist)`,
        testCases: [
          { input: '[6,[[5,2],[5,0],[4,0],[4,1],[2,3],[3,1]]]', expectedOutput: '4 5 0 2 3 1', isHidden: false },
          { input: '[4,[[0,1],[0,2],[1,3]]]', expectedOutput: '0 1 2 3', isHidden: false },
          { input: '[3,[[0,1],[1,2],[0,2]]]', expectedOutput: '0 1 2', isHidden: true },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // TREES — 6 questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'TREES',
    label: 'Trees & Binary Trees',
    description: 'Binary tree construction, traversals, height, paths, and BST operations.',
    questions: [
      {
        title: 'Height of Binary Tree', difficulty: BankDifficulty.Easy, defaultScore: 15,
        tags: ['Tree', 'DFS', 'Recursion'],
        functionName: 'heightOfBinaryTree',
        parameters: [{ name: 'tree', type: 'number[]' }],
        returnType: 'number',
        description: `Given a binary tree in level-order notation (use -1 for null), find its height (number of edges on the longest root-to-leaf path).\n\nParameters:\n  tree — level-order array of node values (-1 for null)\n\nReturns:\n  A single integer — the height`,
        testCases: [
          { input: '[[1,2,3,4,5,-1,-1]]', expectedOutput: '2', isHidden: false },
          { input: '[[1,-1,-1]]', expectedOutput: '0', isHidden: false },
          { input: '[[1,2,3,4,-1,-1,5]]', expectedOutput: '2', isHidden: true },
          { input: '[[1,2,-1,3,-1,4,-1]]', expectedOutput: '3', isHidden: true },
        ],
      },
      {
        title: 'Inorder Traversal', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Tree', 'DFS', 'Recursion'],
        functionName: 'inorderTraversal',
        parameters: [{ name: 'tree', type: 'number[]' }],
        returnType: 'number[]',
        description: `Given a binary tree in level-order notation (-1 = null), print its inorder traversal (Left → Root → Right).\n\nParameters:\n  tree — level-order array of node values (-1 for null)\n\nReturns:\n  Node values in inorder (Left → Root → Right)`,
        testCases: [
          { input: '[[1,2,3,4,5,-1,-1]]', expectedOutput: '4 2 5 1 3', isHidden: false },
          { input: '[[4,2,6,1,3,5,7]]', expectedOutput: '1 2 3 4 5 6 7', isHidden: false },
          { input: '[[1,-1,-1]]', expectedOutput: '1', isHidden: true },
        ],
      },
      {
        title: 'Count Leaf Nodes', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Tree', 'DFS', 'Recursion'],
        functionName: 'countLeafNodes',
        parameters: [{ name: 'tree', type: 'number[]' }],
        returnType: 'number',
        description: `Given a binary tree in level-order notation (-1 = null), count the number of leaf nodes.\n\nParameters:\n  tree — level-order array of node values (-1 for null)\n\nReturns:\n  A single integer — count of leaf nodes`,
        testCases: [
          { input: '[[1,2,3,4,5,-1,-1]]', expectedOutput: '3', isHidden: false },
          { input: '[[1,-1,-1]]', expectedOutput: '1', isHidden: false },
          { input: '[[1,2,3,-1,-1,4,5]]', expectedOutput: '3', isHidden: true },
        ],
      },
      {
        title: 'Level Order Traversal', difficulty: BankDifficulty.Easy, defaultScore: 15,
        tags: ['Tree', 'BFS', 'Queue'],
        functionName: 'levelOrderTraversal',
        parameters: [{ name: 'tree', type: 'number[]' }],
        returnType: 'string',
        description: `Given a binary tree in level-order notation (-1 = null), print each level on a separate line, values space-separated.\n\nParameters:\n  tree — level-order array of node values (-1 for null)\n\nReturns:\n  Each level on a separate line, values space-separated`,
        testCases: [
          { input: '[[3,9,20,-1,-1,15,7]]', expectedOutput: '3\n9 20\n15 7', isHidden: false },
          { input: '[[1,2,3,4,5]]', expectedOutput: '1\n2 3\n4 5', isHidden: false },
          { input: '[[1,-1,-1]]', expectedOutput: '1', isHidden: true },
        ],
      },
      {
        title: 'Lowest Common Ancestor (BST)', difficulty: BankDifficulty.Medium, defaultScore: 25,
        tags: ['Tree', 'BST', 'Recursion'],
        functionName: 'lowestCommonAncestor',
        parameters: [{ name: 'tree', type: 'number[]' }, { name: 'p', type: 'number' }, { name: 'q', type: 'number' }],
        returnType: 'number',
        description: `Given a BST (level-order, -1=null) and two node values p and q, find their Lowest Common Ancestor (LCA).\n\nParameters:\n  tree — level-order BST array (-1 for null)\n  p    — first node value\n  q    — second node value\n\nReturns:\n  The value of the LCA node`,
        testCases: [
          { input: '[[6,2,8,0,4,7,9,-1,-1,3,5],2,8]', expectedOutput: '6', isHidden: false },
          { input: '[[6,2,8,0,4,7,9,-1,-1,3,5],2,4]', expectedOutput: '2', isHidden: false },
          { input: '[[2,1,3],1,3]', expectedOutput: '2', isHidden: true },
        ],
      },
      {
        title: 'Maximum Path Sum', difficulty: BankDifficulty.Hard, defaultScore: 35,
        tags: ['Tree', 'DFS', 'Dynamic Programming'],
        functionName: 'maximumPathSum',
        parameters: [{ name: 'tree', type: 'number[]' }],
        returnType: 'number',
        description: `Given a binary tree (level-order, -1=null), find the maximum path sum. A path is any sequence of nodes from some starting node to any node in the tree (need not pass through root).\n\nParameters:\n  tree — level-order array of node values (-1 for null)\n\nReturns:\n  A single integer — the maximum path sum`,
        testCases: [
          { input: '[[1,2,3]]', expectedOutput: '6', isHidden: false },
          { input: '[[-10,9,20,-1,-1,15,7]]', expectedOutput: '42', isHidden: false },
          { input: '[[-3]]', expectedOutput: '-3', isHidden: true },
          { input: '[[5,4,8,11,-1,13,4,7,2,-1,-1,-1,1]]', expectedOutput: '48', isHidden: true },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // DP — 6 questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'DP',
    label: 'Dynamic Programming',
    description: 'Memoization and tabulation problems: paths, subsequences, partitioning, and optimization.',
    questions: [
      {
        title: 'Climbing Stairs', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['DP', 'Memoization'],
        functionName: 'climbingStairs',
        parameters: [{ name: 'n', type: 'number' }],
        returnType: 'number',
        description: `You can climb 1 or 2 steps at a time. Given N steps, find how many distinct ways to reach the top.\n\nParameters:\n  n — number of steps (1 ≤ n ≤ 45)\n\nReturns:\n  Number of distinct ways to climb to the top`,
        testCases: [
          { input: '[2]', expectedOutput: '2', isHidden: false },
          { input: '[3]', expectedOutput: '3', isHidden: false },
          { input: '[10]', expectedOutput: '89', isHidden: true },
          { input: '[45]', expectedOutput: '1836311903', isHidden: true },
        ],
      },
      {
        title: 'Coin Change', difficulty: BankDifficulty.Medium, defaultScore: 25,
        tags: ['DP', 'Greedy', 'Unbounded Knapsack'],
        functionName: 'coinChange',
        parameters: [{ name: 'coins', type: 'number[]' }, { name: 'amount', type: 'number' }],
        returnType: 'number',
        description: `Given coin denominations and an amount, find the minimum number of coins needed to make that amount. Print -1 if impossible.\n\nParameters:\n  coins  — array of coin denominations\n  amount — the target amount\n\nReturns:\n  Minimum number of coins needed, or -1 if impossible`,
        testCases: [
          { input: '[[1,5,6],11]', expectedOutput: '2', isHidden: false },
          { input: '[[1,2,5],11]', expectedOutput: '3', isHidden: false },
          { input: '[[2,5],3]', expectedOutput: '-1', isHidden: true },
          { input: '[[1],0]', expectedOutput: '0', isHidden: true },
        ],
      },
      {
        title: 'Longest Common Subsequence', difficulty: BankDifficulty.Medium, defaultScore: 25,
        tags: ['DP', 'String', 'LCS'],
        functionName: 'longestCommonSubsequence',
        parameters: [{ name: 'a', type: 'string' }, { name: 'b', type: 'string' }],
        returnType: 'number',
        description: `Given two strings, find the length of their Longest Common Subsequence.\n\nParameters:\n  a — first string\n  b — second string\n\nReturns:\n  A single integer — LCS length`,
        testCases: [
          { input: '["abcde","ace"]', expectedOutput: '3', isHidden: false },
          { input: '["abc","abc"]', expectedOutput: '3', isHidden: false },
          { input: '["abc","def"]', expectedOutput: '0', isHidden: true },
          { input: '["aggtab","gxtxayb"]', expectedOutput: '4', isHidden: true },
        ],
      },
      {
        title: 'Longest Increasing Subsequence', difficulty: BankDifficulty.Medium, defaultScore: 25,
        tags: ['DP', 'Array', 'LIS'],
        functionName: 'longestIncreasingSubsequence',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number',
        description: `Given an array of N integers, find the length of the Longest Strictly Increasing Subsequence.\n\nParameters:\n  arr — array of integers\n\nReturns:\n  A single integer — LIS length`,
        testCases: [
          { input: '[[10,9,2,5,3,7,101,18]]', expectedOutput: '4', isHidden: false },
          { input: '[[0,1,0,3]]', expectedOutput: '3', isHidden: false },
          { input: '[[7,7,7,7,7]]', expectedOutput: '1', isHidden: true },
          { input: '[[3,10,2,1,20,4,18]]', expectedOutput: '4', isHidden: true },
        ],
      },
      {
        title: '0/1 Knapsack', difficulty: BankDifficulty.Medium, defaultScore: 30,
        tags: ['DP', 'Knapsack'],
        functionName: 'knapsack',
        parameters: [{ name: 'weights', type: 'number[]' }, { name: 'values', type: 'number[]' }, { name: 'capacity', type: 'number' }],
        returnType: 'number',
        description: `Given N items each with a weight and value, and a knapsack of capacity W, find the maximum value you can carry (each item can be taken at most once).\n\nParameters:\n  weights  — array of item weights\n  values   — array of item values\n  capacity — maximum weight capacity\n\nReturns:\n  Maximum total value achievable`,
        testCases: [
          { input: '[[10,20,30],[60,100,120],50]', expectedOutput: '220', isHidden: false },
          { input: '[[3,4],[4,5],3]', expectedOutput: '4', isHidden: false },
          { input: '[[1,2,3,5],[1,6,10,16],5]', expectedOutput: '16', isHidden: true },
          { input: '[[5,4,3],[10,40,30],10]', expectedOutput: '70', isHidden: true },
        ],
      },
      {
        title: 'Edit Distance', difficulty: BankDifficulty.Hard, defaultScore: 35,
        tags: ['DP', 'String', 'Levenshtein'],
        functionName: 'editDistance',
        parameters: [{ name: 'a', type: 'string' }, { name: 'b', type: 'string' }],
        returnType: 'number',
        description: `Given two strings, find the minimum number of operations (insert, delete, replace) to convert string A into string B.\n\nParameters:\n  a — the source string\n  b — the target string\n\nReturns:\n  A single integer — minimum edit distance`,
        testCases: [
          { input: '["horse","ros"]', expectedOutput: '3', isHidden: false },
          { input: '["intention","execution"]', expectedOutput: '5', isHidden: false },
          { input: '["abc","abc"]', expectedOutput: '0', isHidden: true },
          { input: '["sunday","saturday"]', expectedOutput: '3', isHidden: true },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // SORTING — 5 questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'SORTING',
    label: 'Sorting Algorithms',
    description: 'Implement and apply sorting algorithms: bubble, merge, quick, and hybrid approaches.',
    questions: [
      {
        title: 'Bubble Sort', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Sorting', 'Array'],
        functionName: 'bubbleSort',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number[]',
        description: `Sort an array of N integers in ascending order using Bubble Sort and print the sorted array.\n\nParameters:\n  arr — array of integers\n\nReturns:\n  The array sorted in ascending order`,
        testCases: [
          { input: '[[64,34,25,12,22]]', expectedOutput: '12 22 25 34 64', isHidden: false },
          { input: '[[3,1,2]]', expectedOutput: '1 2 3', isHidden: false },
          { input: '[[4,3,2,1]]', expectedOutput: '1 2 3 4', isHidden: true },
          { input: '[[42]]', expectedOutput: '42', isHidden: true },
        ],
      },
      {
        title: 'Merge Sort', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['Sorting', 'Divide and Conquer', 'Array'],
        functionName: 'mergeSort',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number[]',
        description: `Sort an array of N integers using Merge Sort and print the sorted array.\n\nParameters:\n  arr — array of integers\n\nReturns:\n  The array sorted in ascending order`,
        testCases: [
          { input: '[[38,27,43,3,9,82]]', expectedOutput: '3 9 27 38 43 82', isHidden: false },
          { input: '[[5,2,4,1]]', expectedOutput: '1 2 4 5', isHidden: false },
          { input: '[[5,4,3,2,1]]', expectedOutput: '1 2 3 4 5', isHidden: true },
          { input: '[[10,7,8,9,1,5,6]]', expectedOutput: '1 5 6 7 8 9 10', isHidden: true },
        ],
      },
      {
        title: 'Count Inversions', difficulty: BankDifficulty.Medium, defaultScore: 25,
        tags: ['Sorting', 'Merge Sort', 'Array'],
        functionName: 'countInversions',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number',
        description: `Given an array of N integers, count the number of inversions (pairs i < j where arr[i] > arr[j]).\n\nParameters:\n  arr — array of integers\n\nReturns:\n  A single integer — the inversion count`,
        testCases: [
          { input: '[[2,4,1,3,5]]', expectedOutput: '3', isHidden: false },
          { input: '[[3,1,2]]', expectedOutput: '2', isHidden: false },
          { input: '[[1,2,3,4,5]]', expectedOutput: '0', isHidden: true },
          { input: '[[4,3,2,1]]', expectedOutput: '6', isHidden: true },
        ],
      },
      {
        title: 'Kth Largest Element', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['Sorting', 'Heap', 'Quick Select'],
        functionName: 'kthLargestElement',
        parameters: [{ name: 'arr', type: 'number[]' }, { name: 'k', type: 'number' }],
        returnType: 'number',
        description: `Given an array of N integers and K, find the Kth largest element (1-indexed).\n\nParameters:\n  arr — array of integers\n  k   — the rank (1-indexed)\n\nReturns:\n  The Kth largest element`,
        testCases: [
          { input: '[[3,2,1,5,6,4],2]', expectedOutput: '5', isHidden: false },
          { input: '[[3,2,3,1,2],4]', expectedOutput: '2', isHidden: false },
          { input: '[[7,2,5],1]', expectedOutput: '7', isHidden: true },
          { input: '[[9,3,6,1],3]', expectedOutput: '3', isHidden: true },
        ],
      },
      {
        title: 'Sort 0s 1s and 2s (Dutch Flag)', difficulty: BankDifficulty.Easy, defaultScore: 15,
        tags: ['Sorting', 'Two Pointers', 'Dutch National Flag'],
        functionName: 'sort012',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'number[]',
        description: `Given an array of only 0s, 1s, and 2s, sort it in-place in a single pass.\n\nParameters:\n  arr — array containing only 0s, 1s, and 2s\n\nReturns:\n  The array sorted in a single pass`,
        testCases: [
          { input: '[[2,0,2,1,1,0]]', expectedOutput: '0 0 1 1 2 2', isHidden: false },
          { input: '[[2,0,1]]', expectedOutput: '0 1 2', isHidden: false },
          { input: '[[1,1,1,1,1]]', expectedOutput: '1 1 1 1 1', isHidden: true },
          { input: '[[2,2,0,0]]', expectedOutput: '0 0 2 2', isHidden: true },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // RECURSION — 5 questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'RECURSION',
    label: 'Recursion & Backtracking',
    description: 'Solve problems using recursive decomposition, memoization, and backtracking strategies.',
    questions: [
      {
        title: 'Power of a Number', difficulty: BankDifficulty.Easy, defaultScore: 10,
        tags: ['Recursion', 'Math'],
        functionName: 'powerOfNumber',
        parameters: [{ name: 'base', type: 'number' }, { name: 'exp', type: 'number' }],
        returnType: 'number',
        description: `Compute base^exp using recursion.\n\nParameters:\n  base — the base integer\n  exp  — the exponent (non-negative)\n\nReturns:\n  A single integer — base^exp`,
        testCases: [
          { input: '[2,10]', expectedOutput: '1024', isHidden: false },
          { input: '[3,0]', expectedOutput: '1', isHidden: false },
          { input: '[5,4]', expectedOutput: '625', isHidden: true },
          { input: '[-2,5]', expectedOutput: '-32', isHidden: true },
        ],
      },
      {
        title: 'Generate All Subsets', difficulty: BankDifficulty.Medium, defaultScore: 20,
        tags: ['Recursion', 'Backtracking', 'Array'],
        functionName: 'generateAllSubsets',
        parameters: [{ name: 'arr', type: 'number[]' }],
        returnType: 'string',
        description: `Given N distinct integers, print all 2^N subsets in lexicographic order. Each subset on one line, elements space-separated. Print an empty line for the empty subset.\n\nParameters:\n  arr — sorted array of N distinct integers\n\nReturns:\n  All 2^N subsets, one per line (empty line for empty set), sorted lexicographically`,
        testCases: [
          { input: '[[1,2]]', expectedOutput: '\n1\n1 2\n2', isHidden: false },
          { input: '[[5]]', expectedOutput: '\n5', isHidden: false },
          { input: '[[1,2,3]]', expectedOutput: '\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3', isHidden: true },
        ],
      },
      {
        title: 'Tower of Hanoi', difficulty: BankDifficulty.Easy, defaultScore: 15,
        tags: ['Recursion'],
        functionName: 'towerOfHanoi',
        parameters: [{ name: 'n', type: 'number' }],
        returnType: 'string',
        description: `Print moves to solve Tower of Hanoi for N disks from rod A to rod C using rod B as auxiliary.\n\nParameters:\n  n — number of disks\n\nReturns:\n  One move per line: "Move disk D from X to Y"`,
        testCases: [
          { input: '[2]', expectedOutput: 'Move disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C', isHidden: false },
          { input: '[1]', expectedOutput: 'Move disk 1 from A to C', isHidden: false },
          { input: '[3]', expectedOutput: 'Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B\nMove disk 3 from A to C\nMove disk 1 from B to A\nMove disk 2 from B to C\nMove disk 1 from A to C', isHidden: true },
        ],
      },
      {
        title: 'Word Search (Count Paths)', difficulty: BankDifficulty.Hard, defaultScore: 35,
        tags: ['Recursion', 'Backtracking', 'Grid'],
        functionName: 'wordSearch',
        parameters: [{ name: 'board', type: 'string[][]' }, { name: 'word', type: 'string' }],
        returnType: 'boolean',
        description: `Given a grid of characters and a target word, determine if the word exists in the grid (horizontally or vertically adjacent cells, each cell used at most once).\n\nParameters:\n  board — 2D grid of characters (string[][])\n  word  — the target word to find\n\nReturns:\n  true if the word exists in the grid, false otherwise`,
        testCases: [
          { input: '[[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"],["E","G","K","S"]],"SEE"]', expectedOutput: 'true', isHidden: false },
          { input: '[[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"],["E","G","K","S"]],"ABCB"]', expectedOutput: 'false', isHidden: false },
          { input: '[[["A","A","A","A"],["A","A","A","A"],["A","A","A","A"]],"AAAAAAAAAAAAA"]', expectedOutput: 'false', isHidden: true },
        ],
      },
      {
        title: 'N-Queens Count', difficulty: BankDifficulty.Hard, defaultScore: 40,
        tags: ['Recursion', 'Backtracking', 'N-Queens'],
        functionName: 'nQueensCount',
        parameters: [{ name: 'n', type: 'number' }],
        returnType: 'number',
        description: `Given N, count the number of ways to place N non-attacking queens on an N×N chessboard.\n\nParameters:\n  n — the board size (1 ≤ n ≤ 10)\n\nReturns:\n  Total number of distinct ways to place n non-attacking queens`,
        testCases: [
          { input: '[4]', expectedOutput: '2', isHidden: false },
          { input: '[1]', expectedOutput: '1', isHidden: false },
          { input: '[8]', expectedOutput: '92', isHidden: true },
          { input: '[6]', expectedOutput: '4', isHidden: true },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // OOP — 10 MCQ questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'OOP',
    label: 'Object-Oriented Programming',
    description: 'MCQ questions on classes, inheritance, polymorphism, encapsulation, and design patterns.',
    questions: [
      {
        title: 'Which OOP principle hides internal implementation details?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'],
        tags: ['OOP', 'Encapsulation'],
        description: 'Select the OOP principle that bundles data and methods together while restricting direct access to some components.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'Which keyword prevents a class from being subclassed in Java?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['static', 'abstract', 'final', 'private'],
        tags: ['OOP', 'Java', 'Inheritance'],
        description: 'Choose the Java keyword that makes a class non-inheritable.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What is method overloading?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: [
          'A subclass redefines a superclass method with the same signature',
          'Multiple methods in the same class share a name but differ in parameters',
          'A class inherits methods from multiple parents',
          'A method calls itself recursively',
        ],
        tags: ['OOP', 'Polymorphism'],
        description: 'Identify the correct definition of method overloading.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which design pattern ensures only one instance of a class exists?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['Factory', 'Observer', 'Singleton', 'Decorator'],
        tags: ['OOP', 'Design Patterns'],
        description: 'Choose the creational design pattern that restricts instantiation to a single object.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What does the "super" keyword do in Java?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: [
          'Creates a new instance of the parent class',
          'Calls the parent class constructor or method',
          'Prevents method overriding',
          'Declares a static parent reference',
        ],
        tags: ['OOP', 'Java', 'Inheritance'],
        description: 'Select the correct use of the "super" keyword.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which relationship is described as "is-a"?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['Composition', 'Aggregation', 'Inheritance', 'Association'],
        tags: ['OOP', 'Inheritance'],
        description: 'Identify the OOP relationship that represents the "is-a" connection between two classes.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What is an abstract class?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: [
          'A class with only static methods',
          'A class that cannot have any methods',
          'A class that cannot be instantiated and may have abstract methods',
          'A class that is automatically garbage collected',
        ],
        tags: ['OOP', 'Abstraction'],
        description: 'Choose the correct description of an abstract class.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'Which principle states that a subclass should be substitutable for its parent?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['Open/Closed Principle', 'Liskov Substitution Principle', 'Dependency Inversion', 'Single Responsibility'],
        tags: ['OOP', 'SOLID'],
        description: 'Identify the SOLID principle about subtype substitutability.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'What is a constructor?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: [
          'A method that destroys an object',
          'A method with no return type that initializes an object',
          'A static method used to create objects',
          'A method inherited from Object class',
        ],
        tags: ['OOP'],
        description: 'Select the correct definition of a constructor.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which pattern defines a family of algorithms and makes them interchangeable?',
        difficulty: BankDifficulty.Hard, defaultScore: 15,
        type: 'MCQ' as any, options: ['Template Method', 'Strategy', 'Command', 'State'],
        tags: ['OOP', 'Design Patterns'],
        description: 'Identify the behavioral design pattern that encapsulates a family of algorithms.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // DBMS — 10 MCQ questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'DBMS',
    label: 'Database & SQL',
    description: 'MCQ questions on SQL, normalization, transactions, indexing, and relational algebra.',
    questions: [
      {
        title: 'Which SQL clause filters rows after grouping?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
        tags: ['SQL', 'Aggregation'],
        description: 'Select the SQL clause used to filter groups formed by GROUP BY.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which normal form eliminates transitive dependencies?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['1NF', '2NF', '3NF', 'BCNF'],
        tags: ['DBMS', 'Normalization'],
        description: 'Choose the normal form that removes transitive functional dependencies.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What does ACID stand for in database transactions?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Accuracy, Consistency, Integrity, Durability',
          'Atomicity, Concurrency, Isolation, Dependency',
          'Availability, Consistency, Isolation, Durability',
        ],
        tags: ['DBMS', 'Transactions'],
        description: 'Identify what the ACID acronym stands for.',
        testCases: [{ input: '', expectedOutput: 'A', isHidden: false }],
      },
      {
        title: 'Which join returns only rows with matching values in both tables?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'INNER JOIN'],
        tags: ['SQL', 'Joins'],
        description: 'Select the SQL join type that returns only matching rows from both tables.',
        testCases: [{ input: '', expectedOutput: 'D', isHidden: false }],
      },
      {
        title: 'What is a primary key?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: [
          'Any column that can contain NULL values',
          'A column referencing another table\'s primary key',
          'A unique, non-null column that identifies each row',
          'An index created automatically on every column',
        ],
        tags: ['DBMS', 'Keys'],
        description: 'Choose the correct definition of a primary key.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'Which isolation level prevents dirty reads but allows non-repeatable reads?',
        difficulty: BankDifficulty.Hard, defaultScore: 15,
        type: 'MCQ' as any, options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
        tags: ['DBMS', 'Transactions', 'Isolation'],
        description: 'Identify the transaction isolation level that prevents dirty reads only.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which SQL command removes all rows from a table without logging individual deletions?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'],
        tags: ['SQL'],
        description: 'Select the SQL command that removes all rows from a table faster than DELETE.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What is a B-tree index primarily used for?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: [
          'Full-text search only',
          'Speeding up range queries and equality lookups',
          'Storing BLOBs efficiently',
          'Enforcing foreign key constraints',
        ],
        tags: ['DBMS', 'Indexing'],
        description: 'Choose the main purpose of a B-tree index in a relational database.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which relational algebra operation combines tuples from two relations with all combinations?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['Union', 'Selection', 'Cartesian Product', 'Projection'],
        tags: ['DBMS', 'Relational Algebra'],
        description: 'Identify the relational algebra operation equivalent to a cross join.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What does a foreign key constraint enforce?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: [
          'Uniqueness of values in a column',
          'Referential integrity between two tables',
          'Non-null values in a column',
          'Sequential auto-increment of a column',
        ],
        tags: ['DBMS', 'Keys', 'Constraints'],
        description: 'Select the correct purpose of a foreign key constraint.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // OS — 10 MCQ questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'OS',
    label: 'Operating Systems',
    description: 'MCQ questions on process scheduling, memory management, deadlocks, synchronization, and file systems.',
    questions: [
      {
        title: 'Which scheduling algorithm can cause starvation?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['Round Robin', 'FCFS', 'Priority Scheduling', 'SRTF'],
        tags: ['OS', 'Scheduling'],
        description: 'Select the CPU scheduling algorithm most likely to cause starvation of low-priority processes.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'Which page replacement algorithm suffers from Belady\'s Anomaly?',
        difficulty: BankDifficulty.Hard, defaultScore: 15,
        type: 'MCQ' as any, options: ['LRU', 'Optimal', 'FIFO', 'LFU'],
        tags: ['OS', 'Memory Management'],
        description: 'Identify the page replacement algorithm where increasing frames can increase page faults.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What are the four necessary conditions for deadlock?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: [
          'Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait',
          'Starvation, Priority Inversion, Hold & Wait, Circular Wait',
          'Mutual Exclusion, Preemption, No Hold & Wait, Circular Wait',
          'Race Condition, Hold & Wait, No Preemption, Circular Wait',
        ],
        tags: ['OS', 'Deadlock'],
        description: 'Choose the correct set of four Coffman conditions for deadlock.',
        testCases: [{ input: '', expectedOutput: 'A', isHidden: false }],
      },
      {
        title: 'Which memory allocation scheme suffers from external fragmentation?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['Paging', 'Segmentation', 'Both Paging and Segmentation', 'Neither'],
        tags: ['OS', 'Memory Management'],
        description: 'Identify which memory allocation scheme is susceptible to external fragmentation.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'What is a semaphore used for in OS?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: [
          'Speeding up context switches',
          'Synchronizing access to shared resources',
          'Managing virtual memory pages',
          'Scheduling processes by priority',
        ],
        tags: ['OS', 'Synchronization'],
        description: 'Select the primary use of semaphores in operating systems.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which system call creates a new process in Unix/Linux?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['exec()', 'spawn()', 'fork()', 'clone()'],
        tags: ['OS', 'Processes'],
        description: 'Choose the Unix system call that creates a child process by duplicating the parent.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What is thrashing in virtual memory?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: [
          'Excessive context switching between processes',
          'A process spending more time swapping pages than executing',
          'Overflow of the physical memory address space',
          'Deadlock caused by memory resource contention',
        ],
        tags: ['OS', 'Memory Management'],
        description: 'Identify the correct description of thrashing.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which IPC mechanism is best suited for large data transfers between processes?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['Pipes', 'Signals', 'Shared Memory', 'Message Queues'],
        tags: ['OS', 'IPC'],
        description: 'Select the Inter-Process Communication mechanism most efficient for large data.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'In the Banker\'s Algorithm, what is a "safe state"?',
        difficulty: BankDifficulty.Hard, defaultScore: 15,
        type: 'MCQ' as any, options: [
          'A state where no process is waiting for resources',
          'A state where at least one process can complete and release resources',
          'A state where all processes are in the ready queue',
          'A state where deadlock has been detected and resolved',
        ],
        tags: ['OS', 'Deadlock', 'Banker\'s Algorithm'],
        description: 'Choose the correct definition of a safe state in the Banker\'s Algorithm.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which file allocation method is best for sequential access?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['Indexed Allocation', 'Linked Allocation', 'Contiguous Allocation', 'Both B and C'],
        tags: ['OS', 'File Systems'],
        description: 'Select the file allocation method that provides best performance for sequential reads.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // NETWORKS — 10 MCQ questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'NETWORKS',
    label: 'Computer Networks',
    description: 'MCQ questions on OSI model, TCP/IP, routing, subnetting, and network protocols.',
    questions: [
      {
        title: 'At which OSI layer does routing occur?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
        tags: ['Networks', 'OSI Model'],
        description: 'Select the OSI layer responsible for routing packets between networks.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'What is the maximum number of hosts in a /26 subnet?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['30', '62', '126', '254'],
        tags: ['Networks', 'Subnetting'],
        description: 'Calculate the number of usable host addresses in a /26 subnet.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which protocol translates domain names to IP addresses?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['DHCP', 'ARP', 'DNS', 'ICMP'],
        tags: ['Networks', 'Protocols'],
        description: 'Identify the protocol responsible for domain name resolution.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What does the TCP three-way handshake consist of?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: [
          'SYN → SYN-ACK → ACK',
          'SYN → ACK → FIN',
          'SYN → SYN → ACK',
          'ACK → SYN-ACK → FIN',
        ],
        tags: ['Networks', 'TCP/IP'],
        description: 'Select the correct sequence of the TCP three-way handshake.',
        testCases: [{ input: '', expectedOutput: 'A', isHidden: false }],
      },
      {
        title: 'Which routing protocol uses Dijkstra\'s algorithm?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['RIP', 'BGP', 'OSPF', 'EIGRP'],
        tags: ['Networks', 'Routing'],
        description: 'Identify the link-state routing protocol that uses Dijkstra\'s shortest-path algorithm.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What is the purpose of ARP?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: [
          'Translating domain names to IP addresses',
          'Assigning IP addresses dynamically',
          'Mapping IP addresses to MAC addresses',
          'Encrypting network traffic',
        ],
        tags: ['Networks', 'ARP'],
        description: 'Select the primary function of the Address Resolution Protocol.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'Which layer of the OSI model does a switch primarily operate at?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer'],
        tags: ['Networks', 'OSI Model'],
        description: 'Identify the OSI layer where a switch forwards frames using MAC addresses.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'What is the difference between TCP and UDP?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: [
          'TCP is connectionless; UDP is connection-oriented',
          'TCP guarantees delivery; UDP does not',
          'TCP is faster than UDP for all use cases',
          'UDP uses three-way handshake; TCP does not',
        ],
        tags: ['Networks', 'TCP/IP'],
        description: 'Select the key difference between TCP and UDP.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which protocol is used to send email?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['IMAP', 'POP3', 'SMTP', 'FTP'],
        tags: ['Networks', 'Protocols'],
        description: 'Choose the protocol used for sending (not receiving) email messages.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What does NAT do in networking?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: [
          'Converts private IP addresses to public IP addresses',
          'Encrypts all outgoing packets',
          'Assigns MAC addresses to devices',
          'Routes packets using the shortest path algorithm',
        ],
        tags: ['Networks', 'NAT'],
        description: 'Select the primary function of Network Address Translation.',
        testCases: [{ input: '', expectedOutput: 'A', isHidden: false }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // PYTHON — 10 MCQ questions
  // ─────────────────────────────────────────────────────────────
  {
    tag: 'PYTHON',
    label: 'Python Programming',
    description: 'MCQ questions on Python idioms, list comprehensions, generators, decorators, and standard library.',
    questions: [
      {
        title: 'What is the output of: type([]) in Python?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ["<class 'list'>", "<class 'array'>", "list", "[]"],
        tags: ['Python', 'Types'],
        description: "Select the output of calling type([]) in Python.",
        testCases: [{ input: '', expectedOutput: 'A', isHidden: false }],
      },
      {
        title: 'Which method removes and returns the last element of a Python list?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['remove()', 'delete()', 'pop()', 'discard()'],
        tags: ['Python', 'Lists'],
        description: 'Select the list method that removes and returns the last item.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What does a Python generator function use instead of return?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['yield', 'produce', 'emit', 'send'],
        tags: ['Python', 'Generators'],
        description: 'Choose the keyword used in a generator function to produce values lazily.',
        testCases: [{ input: '', expectedOutput: 'A', isHidden: false }],
      },
      {
        title: 'Which Python built-in creates an iterator over consecutive integers?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['seq()', 'range()', 'arange()', 'linspace()'],
        tags: ['Python', 'Built-ins'],
        description: 'Select the Python built-in function that produces a sequence of integers.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'What is the result of: "hello"[::-1] in Python?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['hello', 'olleh', 'helo', 'Error'],
        tags: ['Python', 'Strings', 'Slicing'],
        description: 'Select the output of reversing the string "hello" using slice notation.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'What does the @property decorator do in Python?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: [
          'Makes a method a class method',
          'Turns a method into a static method',
          'Allows a method to be accessed like an attribute',
          'Caches the return value of a method',
        ],
        tags: ['Python', 'Decorators', 'OOP'],
        description: 'Choose the correct effect of the @property decorator.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'Which Python data structure uses key-value pairs?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['list', 'tuple', 'set', 'dict'],
        tags: ['Python', 'Data Structures'],
        description: 'Select the Python built-in data structure that maps keys to values.',
        testCases: [{ input: '', expectedOutput: 'D', isHidden: false }],
      },
      {
        title: 'What is the output of: bool("") in Python?',
        difficulty: BankDifficulty.Easy, defaultScore: 5,
        type: 'MCQ' as any, options: ['True', 'False', 'None', 'Error'],
        tags: ['Python', 'Truthiness'],
        description: 'Select the boolean value of an empty string in Python.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
      {
        title: 'Which Python module provides high-performance array operations?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: ['math', 'os', 'numpy', 'sys'],
        tags: ['Python', 'Libraries'],
        description: 'Choose the Python library most commonly used for numerical array computations.',
        testCases: [{ input: '', expectedOutput: 'C', isHidden: false }],
      },
      {
        title: 'What is a Python list comprehension?',
        difficulty: BankDifficulty.Medium, defaultScore: 10,
        type: 'MCQ' as any, options: [
          'A way to sort a list in one line',
          'A concise syntax to create a new list from an iterable with an optional filter',
          'A method that compresses a list by removing duplicates',
          'A decorator that converts functions to list generators',
        ],
        tags: ['Python', 'List Comprehension'],
        description: 'Identify the correct definition of a list comprehension in Python.',
        testCases: [{ input: '', expectedOutput: 'B', isHidden: false }],
      },
    ],
  },
];

async function main() {
  console.log('Seeding question banks…');

  for (const bank of banks) {
    const { questions, ...bankData } = bank;

    const created = await prisma.questionBank.upsert({
      where: { tag: bankData.tag },
      update: { label: bankData.label, description: bankData.description },
      create: bankData,
    });

    for (const q of questions) {
      const { testCases, ...qData } = q;

      const existing = await prisma.bankQuestion.findFirst({
        where: { bankId: created.id, title: qData.title },
      });

      if (!existing) {
        await prisma.bankQuestion.create({
          data: {
            ...qData,
            bankId: created.id,
            testCases: { create: testCases },
          },
        });
        console.log(`  ✓ ${bank.tag}: ${qData.title}`);
      } else {
        await prisma.bankQuestion.update({
          where: { id: existing.id },
          data: {
            ...qData,
            testCases: {
              deleteMany: {},
              create: testCases,
            },
          },
        });
        console.log(`  ↻ ${bank.tag}: ${qData.title} updated`);
      }
    }

    if (questions.length === 0) {
      console.log(`  ○ ${bank.tag}: empty category created`);
    }
  }

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
