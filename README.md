# Virtual DOM Workshop

# What is Virtual DOM

Virtual DOM is a pretty fancy statement. To break it down, think of when you run server scripts, you filter and control what you are sending back as a response. This request/response model is basically what Virtual DOM act as for actual HTML Nodes. Based on "requests," which are events from the DOM (user inputs) or external triggers (server callbacks), Virtual DOM acts as the "server script" in which will send as a "response" to the actual DOM to control and reflect any changes. 

![Virtual Dom](http://i.imgur.com/EoWu669.png)

# Why Virtual DOM

The reason why such middleware is necessary is because of three major reasons:
- Perfomance
- Flexibility
- Testability
 

## Performance

Thanks to recent development and growth in Javascript, the language is really fast for being a high-level language. However, the DOM manipulation is still a costly process. By incorporating taxing logic on the Virtual Dom, and only updating the Actual DOM when there are changes, it will certainly improve the performance of web application.

## Flexibility

Even if VDOM did not have the performance edge, it would definitely have a flexibility edge. DOM node tree are somewhat "locked in" once in place. There are ways to manipulate them, but it is a lot easier to change properties and values on javascript objects that represents a node. 

## Testability

Because of VDOM is a representation of HTML, it is a lot easier to test for interactions to the DOM without actually implementing to the HTML. You can easily test for complex Virtual DOMs by incorporating useful "assert" tools, such as, "deepEqual"


# Preparation

NOTE: The structure is very closely based to REACT without its convenient JSX compiler. Everything will be written in our workshop as if we didn't not have the compiler

Also, if you never touched React before, it is highly recommended that you go over these tutorial videos:
- [React's Hello World](https://egghead.io/lessons/react-hello-world-first-component)
- [Then `render` Method](https://egghead.io/lessons/react-the-render-method)
- [State Basics](https://egghead.io/lessons/react-state-basics)


This will give you a basic idea of how VDOM is used in React.

# Making Virtual DOM

### Exercise 1: VDOM Definition

In order to make a VDOM, all you need is to do is make a javascript object that represents what the actual HTML node might be. For example:

    {
        tag : 'div',
        attrs : {
            className : 'class-name'
        },
        children : 'Hello World!'
    }
    
With this amount of information, you will be able to make an actual HTML like this:

    <div class="class-name">Hello World!</div>
    

React.js uses type of approach by using the `createElement` function

    var vDom = React.createElement('div', {className : 'class-name'}, 'Hello World!');
    // vDom outputs:
    {
        ...
        type : 'div'
        props: {
            className : 'class-name',
            children  : 'Hello World!'
        }
        ...
    }
    
In this exercise, you will be basically emulating `createElement` function and how it will return as a virtual DOM.


### Exercise 2: Custom Components

One of the popular concepts in Virtual DOM is the ability to filter and control what you show to the actual DOM. Javascript objects are far more flexible than DOM nodes, and we can use this advantage to create meaning beyond just `div` and `span`.

Take this for instance:

    // We are hypothetically using the VDOM library,
    // which is "loosely" based on REACT :D
    vElem = VDOM.createElement('button' { className : 'btn btn-warning' }, 'Warn!');
    
    // vElem will output:
    {
        tag : 'button',
        attr : {
            className : 'btn btn-warning'
        }
        children : 'GODZILLA!'
    }
    
Custom components is basically a way to abstract this procedure to where we can attach what it actually stands for. The element above is a button that is supposed to warn if Godzilla is coming. Instead of just creating an element, almost emulating how we would do in regular HTML, we can spice it up for a bit!

    var GodzillaWarning = VDOM.createClass({
        displayName : 'GodzillaWarning',
        render      : function() {
            return VDOM.createElement(VDOM.createElement('button' { className : 'btn btn-warning' }, 'GODZILLA!'));
        }
    });
    
The `GodzillaWarning` variable can be passed in `createElement` function to retrieve the same Virtual DOM object we had previously.

The purpose of `createClass` is to implement a customized element to the view. Instead of only creating representations of HTML elements, we can further dive and alter the way you can interact with the node, which we will get to detail later.

In our exercise, when we will implement `createClass` which will output will output a function that will return a virtual DOM javascript object once invoked.



### Exercise #3 Render
After creating the Virtual DOM tree, what completes a virtual DOM is the bridge to the actual HTML, and the bridge is called rendering. Rendering functionality will convert the javascript object to HTML that you can inject in any existing HTML node.

If we take a look at React, they implement this functionality by using:

    var virtualElement = React.createElement('div',null,'Hello World');
    React.render(virtualElement, document.body);
    
This will update your HTML to display:

    <body>
        <div data-reactid=".0">Hello World</div>
    </body>
    
Using the virual DOM objects created from your `createElement` and `createClass` functionality you created, implement `render` functionality that will actually imbed the HTML

### Exercise #4 Data Binding

The true intentions of `createClass`, or in React terms, custom components, is the bread and butter of what make VDOMs great: data-binding. Instead of evaluating and rendering with nodes with static values, implementing references that can dynamically change draws in a whole new powerful playground to front-end development. This is also the biggest task that many modern front-end framework is trying to tackle, and with this work shop, you can try to take a stab at it as well.

To give an overview, in terms of virtual DOMs and custom components, you need to have an initialization of where and what data is being binded. In React, there is a `setState` function in which will establish variables that can be modified and updated in the display.

Here is an example:

     var buttonWidget = VDOM.createClass('customButton', {
            setState : function() {
                return { 
                    count : 0
                };
            },
            render : function() {
                return VDOM.createElement('div', null, [
                        VDOM.createElement('button', null, 'click me'),
                        VDOM.createElement('span', null, this.state.count)
                ]);
            }
        });
    
When this gets rendered You will see a regular html like this:
    
    <div data-reactid=".0">
        <button data-reactid=".0">click me</button>
        <span data-reactid=".1">0</span>
    </div>
    
For now everything is basically the same as before. But what if we added some functionality to it?

    var buttonWidget = React.createClass('customButton', {
            setState : function() {
                return { 
                    count : 0
                };
            },
            tick : function() {
                this.state.count++;
            }
            render : function() {
                return VDOM.createElement('div', null, [
                        VDOM.createElement('button', {
                            onClick : this.tick
                        }, 'click me'),
                        VDOM.createElement('span', null, this.state.count)
                ]);
            }
        });
    
This will actually bind the button with the `tick` method that will update the state and reflect that on our display. So if clicked the `span` tag's text will increment by 1.

On your last part of exercise, you will be responsible to accomplish this data binding with virtual DOM. 

## Extra Credit: Diff ##

If you have not already. Implement the state changes where the changes in the actual DOM is done in the most performant way as possible.

For example, you would only want to re-render the data that is actually changed instead of re-rendering the entire Virtual DOM.

    

    



