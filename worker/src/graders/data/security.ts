import type { ChallengeGrader } from "../../../../shared/challenges";

/**
 * SERVER-ONLY graders for the "security" group (tracks: cyber-security, reverse-engineering).
 * Matching meta: data/challenges/security.ts. Flags are stored as SHA-256 hashes only; the
 * reference solvers that derive them from the public puzzle files live in
 * tests/fixtures/challenge-references/security.ts.
 */
export const securityGraders: ChallengeGrader[] = [
  { id: "sec-auth-log-hunt", kind: "flag", flagHash: "9ed7785431fe10ad23d4490148cd5b08e080e9dcf0eaabafabf82018dfca551a" },
  { id: "sec-salted-wordlist", kind: "flag", flagHash: "c196e59a3804d35679817eae5ea277907b9794871c62c5608cf9d845bf7226ef" },
  { id: "sec-crypto-ladder", kind: "flag", flagHash: "4dd3a82180f7295fb70e9cb2331071995c7961e702140b4e5a6b56c715283156" },
  { id: "re-js-unmask", kind: "flag", flagHash: "3cbef4dd8a7f085461f5b7cf9c2408596d487cbdf6c3397a505b31dc7d03b0fb" },
  { id: "re-crackme-checker", kind: "flag", flagHash: "f888b7395f5c3dadb4e9ee127f652bc40cf4fd560c82b6f97ee9a3d8a2872399" },
  {
    id: "sec-password-strength",
    kind: "output",
    // float mode: the numbers may differ by half a rounding step (0.05), the rating words must match exactly.
    tests: [
      { name: "sample", stdin: "3\nhunter2\ncorrect horse battery staple\nPASSWORD\n", expected: "36.2 reasonable\n164.7 very strong\n0.0 very weak\n", mode: "float", epsilon: 0.051 },
      { name: "mixed classes", stdin: "2\nTr0ub4dor&3\nabc\n", expected: "72.3 strong\n14.1 very weak\n", mode: "float", epsilon: 0.051 },
      { name: "digits only", stdin: "1\n123456789012\n", expected: "39.9 reasonable\n", mode: "float", epsilon: 0.051 },
      { name: "common passwords", stdin: "11\nPassword\nLETMEIN\n123456\n12345678\nQwErTy\nABC123\niloveyou\nadmin\nadmin1\npassword1\nQwerty!\n", expected: "0.0 very weak\n0.0 very weak\n0.0 very weak\n0.0 very weak\n0.0 very weak\n0.0 very weak\n0.0 very weak\n0.0 very weak\n31.0 weak\n46.5 reasonable\n44.9 reasonable\n", mode: "float", epsilon: 0.051, hidden: true },
      { name: "empty and tiny", stdin: "5\naaaa\n\nZZ99\n!\n0\n", expected: "18.8 very weak\n0.0 very weak\n20.7 very weak\n5.0 very weak\n3.3 very weak\n", mode: "float", epsilon: 0.051, hidden: true },
      { name: "symbols and spaces", stdin: "4\np@ss w0rd\na b\n~!@#$%^&*()\nHello, World 2026\n", expected: "55.0 reasonable\n17.6 very weak\n55.5 reasonable\n111.7 strong\n", mode: "float", epsilon: 0.051, hidden: true },
      { name: "band edges", stdin: "7\nabcde\nabcdef\nABCDEFGH\nPassw0rd\n0123456789\nzzzzzzzzzzzzzzzzzzzzzzzzzzzz\nZq4$Zq4$Zq4$Zq4$Zq4$\n", expected: "23.5 very weak\n28.2 weak\n37.6 reasonable\n47.6 reasonable\n33.2 weak\n131.6 very strong\n131.4 very strong\n", mode: "float", epsilon: 0.051, hidden: true },
      { name: "long passwords", stdin: "3\naaaaaaaaaaaaaaaaaaaa\nXy7!Xy7!Xy7!Xy7!Xy7!Xy7!Xy7!Xy7!Xy7!Xy7!Xy7!Xy7!Xy7!Xy7!Xy7!\nThe quick brown Fox jumps over 13 lazy dogs, again & again & again & again.The quick brown Fox jumps over 13 lazy dogs, again & again & again & again.\n", expected: "94.0 strong\n394.2 very strong\n985.5 very strong\n", mode: "float", epsilon: 0.051, hidden: true },
      { name: "bulk", stdin: "40\nESTUPFWCTHXKVEJZT\nWCCKGkya\nkuN}!LR\n}qK:u+o/SygUw\ns\n![:+?$^=:-)]:>(+/!-$$\n?#)&{*\n[:D!MJ})L(~_*\nkE277R35Ox0H752f7i77v7eg\n9bUQ1=6D\n<&\n;r[,ge+az{<>\n;?!$ =?}<-,!_;%{;*##\ns_ds;muhj4b#9^f.9c6460\ndiukzkvxz\nvbva(^-lk+;?\nLY<={YAKJO[VPJB\nWuLu(EMAi&o>Vvr$K}wxW!\n^?:*\nG,D>7I9<R4\n;/) :^:}_?[ =$?*,*{#=^?:\nIKLCGTUZJCDHJHPFMAS\nNRXAMOCHCKKAMNOGPIHWPN\nhwi07r$Pp81i^76801cF0b\nRb1c9bh4lVYOdMr2ZH2JF\n3<\n>24:P{9HA$;}0ED47R1\nwb;G.~97@202%69)J5<EQt\nyn\nAZQ64;Q=940J+\n+i;56{4y2]j]3875*c92ya\nopkwqgcvwyk\np,\nu#2f6(~=t5[-d7s@4/016\n9_11?O?X;CZC\n3ny7CbdTrp8Ak\n](^+:%[#\n2\nPYSVENH\n!?*%].\n", expected: "79.9 strong\n45.6 reasonable\n44.9 reasonable\n83.3 strong\n4.7 very weak\n105.9 strong\n30.3 weak\n76.5 strong\n142.9 very strong\n52.6 reasonable\n10.1 very weak\n70.6 strong\n100.9 strong\n134.4 very strong\n42.3 reasonable\n70.6 strong\n88.2 strong\n141.0 very strong\n20.2 very weak\n61.1 strong\n121.1 strong\n89.3 strong\n103.4 strong\n144.5 very strong\n125.0 strong\n10.9 very weak\n116.1 strong\n144.5 very strong\n9.4 very weak\n79.4 strong\n134.4 very strong\n51.7 reasonable\n11.8 very weak\n128.3 very strong\n73.3 strong\n77.4 strong\n40.4 reasonable\n3.3 very weak\n32.9 weak\n30.3 weak\n", mode: "float", epsilon: 0.051, hidden: true },
    ],
  },
];
