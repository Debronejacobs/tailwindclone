import { comment, rule, type AstNode, type Comment, type Declaration, type Rule } from './ast'

const BACK_SLASH = '\\'.charCodeAt(0);
const SLASH = '/'.charCodeAt(0);
const STAR = '*'.charCodeAt(0);
const SINGLE_QUOTE = '"'.charCodeAt(0);
const DOUBLE_QUOTE = '\''.charCodeAt(0);
const COLON = ':'.charCodeAt(0);
const SEMICOLON = ';'.charCodeAt(0);
const BREAK_LINE = '\n'.charCodeAt(0);
const SPACE = ' '.charCodeAt(0);
const BACK_SLASH_T = '\t'.charCodeAt(0);
const START_CURLY_BRACKET = '{'.charCodeAt(0);
const END_CURLY_BRACKET = '}'.charCodeAt(0);
const START_PARENTHESIS = '('.charCodeAt(0);
const END_PARENTHESIS = ')'.charCodeAt(0);
const START_BRACKET = '['.charCodeAt(0);
const END_BRACKET = ']'.charCodeAt(0);
const SINGLE_DASH = '-'.charCodeAt(0);
const AT_CHAR = '@'.charCodeAt(0);
const EXCLAMATION_MARK = '!'.charCodeAt(0);

export function parse(input: string) {
  input = input.replaceAll('\r\n', '\n')

  let ast: AstNode[] = []
  let licenseComments: Comment[] = []

  let stack: (Rule | null)[] = []

  let parent = null as Rule | null
  let node = null as AstNode | null

  let current = ''
  let closingBracketStack = ''

  let tmpCharCode;

  for (let i = 0; i < input.length; i++) {
    let char = input.charCodeAt(i);

    // Current character is a `\` therefore the next character is escaped,
    // consume it together with the next character and continue.
    //
    // E.g.:
    //
    // ```css
    // .hover\:foo:hover {}
    //       ^
    // ```
    //
    if (char === BACK_SLASH) {
      current += input.slice(i, i + 2)
      i += 1
    }

    // Start of a comment.
    //
    // E.g.:
    //
    // ```css
    // /* Example */
    // ^^^^^^^^^^^^^
    // .foo {
    //  color: red; /* Example */
    //              ^^^^^^^^^^^^^
    // }
    // .bar {
    //  color: /* Example */ red;
    //         ^^^^^^^^^^^^^
    // }
    // ```
    else if (char === SLASH && input.charCodeAt(i + 1) === STAR) {
      let start = i

      for (let j = i + 2; j < input.length; j++) {
        tmpCharCode = input.charCodeAt(j);

        // Current character is a `\` therefore the next character is escaped.
        if (tmpCharCode === BACK_SLASH) {
          j += 1
        }

        // End of the comment
        else if (tmpCharCode === STAR && input.charCodeAt(j + 1) === SLASH) {
          i = j + 1
          break
        }
      }

      let commentString = input.slice(start, i + 1)

      // Collect all license comments so that we can hoist them to the top of
      // the AST.
      if (commentString.charCodeAt(2) === EXCLAMATION_MARK) {
        licenseComments.push(comment(commentString.slice(2, -2)))
      }
    }

    // Start of a string.
    else if (char === DOUBLE_QUOTE || char === SINGLE_QUOTE) {
      let start = i

      // We need to ensure that the closing quote is the same as the opening
      // quote.
      //
      // E.g.:
      //
      // ```css
      // .foo {
      //   content: "This is a string with a 'quote' in it";
      //                                     ^     ^         -> These are not the end of the string.
      // }
      // ```
      for (let j = i + 1; j < input.length; j++) {
        tmpCharCode = input.charCodeAt(j);
        // Current character is a `\` therefore the next character is escaped.
        if (tmpCharCode === BACK_SLASH) {
          j += 1
        }

        // End of the string.
        else if (tmpCharCode === char) {
          i = j
          break
        }

        // End of the line without ending the string but with a `;` at the end.
        //
        // E.g.:
        //
        // ```css
        // .foo {
        //   content: "This is a string with a;
        //                                    ^ Missing "
        // }
        // ```
        else if (tmpCharCode === SEMICOLON && input.charCodeAt(j + 1) === BREAK_LINE) {
          throw new Error(`Unterminated string: ${input.slice(start, j + 1) + String.fromCharCode(char)}`)
        }

        // End of the line without ending the string.
        //
        // E.g.:
        //
        // ```css
        // .foo {
        //   content: "This is a string with a
        //                                    ^ Missing "
        // }
        // ```
        else if (tmpCharCode === BREAK_LINE) {
          throw new Error(`Unterminated string: ${input.slice(start, j) + String.fromCharCode(char)}`)
        }
      }

      // Adjust `current` to include the string.
      current += input.slice(start, i + 1)
    }

    // Skip whitespace if the next character is also whitespace. This allows us
    // to reduce the amount of whitespace in the AST.
    else if (
      (char === SPACE || char === BREAK_LINE || char === BACK_SLASH_T) &&
      (tmpCharCode = input.charCodeAt(i + 1)) && (tmpCharCode === SPACE || tmpCharCode === BREAK_LINE || tmpCharCode === BACK_SLASH_T)
    ) {
      continue
    }

    // Replace new lines with spaces.
    else if (char === BREAK_LINE) {
      if (current.length === 0) continue

      tmpCharCode = current.charCodeAt(current.length - 1)
      if (tmpCharCode !== SPACE && tmpCharCode !== BREAK_LINE && tmpCharCode !== BACK_SLASH_T) {
        current += ' '
      }
    }

    // Start of a custom property.
    //
    // Custom properties are very permissive and can contain almost any
    // character, even `;` and `}`. Therefore we have to make sure that we are
    // at the correct "end" of the custom property by making sure everything is
    // balanced.
    else if (char === SINGLE_DASH && input.charCodeAt(i + 1) === SINGLE_DASH && current.length === 0) {
      let closingBracketStack = ''

      let start = i
      let colonIdx = -1

      for (let j = i + 2; j < input.length; j++) {
        tmpCharCode = input.charCodeAt(j)

        // Current character is a `\` therefore the next character is escaped.
        if (tmpCharCode === BACK_SLASH) {
          j += 1
        }

        // Start of a comment.
        else if (tmpCharCode === SLASH && input.charCodeAt(j + 1) === STAR) {
          for (let k = j + 2; k < input.length; k++) {
            tmpCharCode = input.charCodeAt(k)
            // Current character is a `\` therefore the next character is escaped.
            if (tmpCharCode === BACK_SLASH) {
              k += 1
            }

            // End of the comment
            else if (tmpCharCode === STAR && input.charCodeAt(k + 1) === SLASH) {
              j = k + 1
              break
            }
          }
        }

        // End of the "property" of the property-value pair.
        else if (colonIdx === -1 && tmpCharCode === COLON) {
          colonIdx = current.length + j - start
        }

        // End of the custom property.
        else if (tmpCharCode === SEMICOLON && closingBracketStack.length === 0) {
          current += input.slice(start, j)
          i = j
          break
        }

        // Start of a block.
        else if (tmpCharCode === START_PARENTHESIS) {
          closingBracketStack += ')'
        } else if (tmpCharCode === START_BRACKET) {
          closingBracketStack += ']'
        } else if (tmpCharCode === START_CURLY_BRACKET) {
          closingBracketStack += '}'
        }

        // End of the custom property if didn't use a `;` to end the custom
        // property.
        //
        // E.g.:
        //
        // ```css
        // .foo {
        //   --custom: value
        //                  ^
        // }
        // ```
        else if ((tmpCharCode === END_CURLY_BRACKET || input.length - 1 === j) && closingBracketStack.length === 0) {
          i = j - 1
          current += input.slice(start, j)
          break
        }

        // End of a block.
        else if (tmpCharCode === END_PARENTHESIS || tmpCharCode === END_BRACKET || tmpCharCode === END_CURLY_BRACKET) {
          if (
            closingBracketStack.length > 0 &&
            input[j] === closingBracketStack[closingBracketStack.length - 1]
          ) {
            closingBracketStack = closingBracketStack.slice(0, -1)
          }
        }
      }

      let declaration = parseDeclaration(current, colonIdx)
      if (parent) {
        parent.nodes.push(declaration)
      } else {
        ast.push(declaration)
      }

      current = ''
    }

    // End of a body-less at-rule.
    //
    // E.g.:
    //
    // ```css
    // @charset "UTF-8";
    //                 ^
    // ```
    else if (char === SEMICOLON && current.charCodeAt(0) === AT_CHAR) {
      node = rule(current, [])

      // At-rule is nested inside of a rule, attach it to the parent.
      if (parent) {
        parent.nodes.push(node)
      }

      // We are the root node which means we are done with the current node.
      else {
        ast.push(node)
      }

      // Reset the state for the next node.
      current = ''
      node = null
    }

    // End of a declaration.
    //
    // E.g.:
    //
    // ```css
    // .foo {
    //   color: red;
    //             ^
    // }
    // ```
    //
    else if (char === SEMICOLON) {
      let declaration = parseDeclaration(current)
      if (parent) {
        parent.nodes.push(declaration)
      } else {
        ast.push(declaration)
      }

      current = ''
    }

    // Start of a block.
    else if (char === START_CURLY_BRACKET) {
      closingBracketStack += '}'

      // At this point `current` should resemble a selector or an at-rule.
      node = rule(current.trim(), [])

      // Attach the rule to the parent in case it's nested.
      if (parent) {
        parent.nodes.push(node)
      }

      // Push the parent node to the stack, so that we can go back once the
      // nested nodes are done.
      stack.push(parent)

      // Make the current node the new parent, so that nested nodes can be
      // attached to it.
      parent = node

      // Reset the state for the next node.
      current = ''
      node = null
    }

    // End of a block.
    else if (char === END_CURLY_BRACKET) {
      if (closingBracketStack === '') {
        throw new Error('Missing opening {')
      }

      closingBracketStack = closingBracketStack.slice(0, -1)

      // When we hit a `}` and `current` is filled in, then it means that we did
      // not complete the previous node yet. This means that we hit a
      // declaration without a `;` at the end.
      if (current.length > 0) {
        // This can happen for nested at-rules.
        //
        // E.g.:
        //
        // ```css
        // @layer foo {
        //   @tailwind utilities
        //                      ^
        // }
        // ```
        if (current.charCodeAt(0) === AT_CHAR) {
          node = rule(current.trim(), [])

          // At-rule is nested inside of a rule, attach it to the parent.
          if (parent) {
            parent.nodes.push(node)
          }

          // We are the root node which means we are done with the current node.
          else {
            ast.push(node)
          }

          // Reset the state for the next node.
          current = ''
          node = null
        }

        // But it can also happen for declarations.
        //
        // E.g.:
        //
        // ```css
        // .foo {
        //   color: red
        //             ^
        // }
        // ```
        else {
          // Split `current` into a `property` and a `value`. At this point the
          // comments are already removed which means that we don't have to worry
          // about `:` inside of comments.
          let colonIdx = current.indexOf(':')

          // Attach the declaration to the parent.
          if (parent) {
            let importantIdx = current.indexOf('!important', colonIdx + 1)
            parent.nodes.push({
              kind: 'declaration',
              property: current.slice(0, colonIdx).trim(),
              value: current
                .slice(colonIdx + 1, importantIdx === -1 ? current.length : importantIdx)
                .trim(),
              important: importantIdx !== -1,
            } satisfies Declaration)
          }
        }
      }

      // We are done with the current node, which means we can go up one level
      // in the stack.
      let grandParent = stack.pop() ?? null

      // We are the root node which means we are done and continue with the next
      // node.
      if (grandParent === null && parent) {
        ast.push(parent)
      }

      // Go up one level in the stack.
      parent = grandParent

      // Reset the state for the next node.
      current = ''
      node = null
    }

    // Any other character is part of the current node.
    else {
      // Skip whitespace at the start of a new node.
      if (current.length === 0 && (char === SPACE || char === BREAK_LINE || char === BACK_SLASH_T)) {
        continue
      }

      current += String.fromCharCode(char)
    }
  }

  // When we are done parsing then everything should be balanced. If we still
  // have a leftover `parent`, then it means that we have an unterminated block.
  if (closingBracketStack.length > 0 && parent) {
    throw new Error(`Missing closing } at ${parent.selector}`)
  }

  if (licenseComments.length > 0) {
    return (licenseComments as AstNode[]).concat(ast)
  }

  return ast
}

function parseDeclaration(current: string, colonIdx: number = current.indexOf(':')): Declaration {
  let importantIdx = current.indexOf('!important', colonIdx + 1)
  return {
    kind: 'declaration',
    property: current.slice(0, colonIdx).trim(),
    value: current.slice(colonIdx + 1, importantIdx === -1 ? current.length : importantIdx).trim(),
    important: importantIdx !== -1,
  }
}
