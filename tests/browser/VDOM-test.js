describe('Virtual Dom\'s createElement function', function() {

    it('takes the tag type as the first argument', function() {
        var vElem = VDOM.createElement('a');

        var actual = {
            tag : vElem.tag,
            attrs : vElem.attrs,
            children : vElem.children
        };

        var expected = {
            tag : 'a',
            attrs : null,
            children : null
        };

        assert.deepEqual(actual, expected);
    });

    it('will throw an error if nothing is passed', function() {
        expect(function() {
            try {
                VDOM.createElement();
            } catch (e) {
                throw e;
            }
        }).to.throw();
    });

    it('can pass in attributes in the second argument, which returns a javascript object with appropriate properties', function() {
        var vElem = VDOM.createElement('div', {
            className : 'testing-class'
        });

        var actual = {
            tag : vElem.tag,
            attrs : vElem.attrs,
            children : vElem.children
        };

        var expected = {
            tag : 'div',
            attrs : {
                className :'testing-class'
            },
            children : null
        };

        assert.deepEqual(actual, expected);
    });

    it('can pass in children in the second argument, which can except text or new nodes', function() {
        var childSpan = VDOM.createElement('span', null, "Hello, world");
        var vElem = VDOM.createElement('div', null, childSpan);

        var actual = {
            tag : vElem.tag,
            attrs : vElem.attrs,
            children : [
                {
                    tag : childSpan.tag,
                    attrs : childSpan.attrs,
                    children : childSpan.children
                }
            ]
        };

        var expected = {
            tag : 'div',
            attrs : null,
            children : [
                {
                    tag : 'span',
                    attrs : null,
                    children : 'Hello, world'
                }
            ]
        };

        assert.deepEqual(actual, expected);
    });
});

describe('VDOM\'s createClass functionality', function() {
    beforeEach(function() {
        if ($('#test-container').length) {
            $('#test-container').html('');
        } else {
            $('body').prepend('<div id="test-container"></div>');
        }
    });

    it("will error if not specifying a custom name", function() {
         expect(function() {
             try {
                 VDOM.createClass();
             } catch (e) {
                 throw e;
             }
         }).to.throw();
    });

    it("is responsible of making custom component, which returns a function that returns its VDOM", function() {
        var CustomButton = VDOM.createClass('CustomButton', {
            render : function() {
                return VDOM.createElement('button', null, 'Test Button');
            }
        });

        var vElem = CustomButton();

        expect(vElem.attrs.className).to.equal('custom-button');
        expect(vElem.children).to.equal('Test Button');
    });

    it("can attach external child and attributes to the component", function() {
        var CustomContainer = VDOM.createClass('customContainer', {
            render : function() {
                return VDOM.createElement('div')
            }
        });

        var vElem = VDOM.createElement(CustomContainer, {
            className : 'another-class'
        }, [
            VDOM.createElement('p', null, 'Hello,'),
            VDOM.createElement('p', null, 'WORLD!')
        ]);

        expect(vElem.children.length).to.equal(2);
        expect(vElem.attrs.className).to.equal('another-class');
        expect(vElem.children[0].children).to.equal('Hello,');
        expect(vElem.children[1].children).to.equal('WORLD!');
    });
});


describe('Virtual Dom\'s render function', function() {
    beforeEach(function() {
        if ($('#test-container').length) {
            $('#test-container').html('');
        } else {
            $('body').prepend('<div id="test-container"></div>');
        }
    });

    it("ill throw an error if no DOM is defined", function() {
        var elem = VDOM.createElement('div');
        expect(function() {
            try {
                VDOM.render(elem, null);
            } catch (e) {
                throw e;
            }
        }).to.throw();
    });

    it("will place the VDOM Element to the root of the application DOM, which is taken as a second parameter.", function() {
        var elem = VDOM.createElement('h1', {
            className : 'hello-world'
        }, "Hello World!");

        VDOM.render(elem, $('#test-container')[0]);

        expect($('#test-container').find('.hello-world').text()).to.equal('Hello World!');
    });

    it("will render the component to a virtual DOM when passed in createElement function", function() {
        var customButton = VDOM.createClass('customButton', {
            render : function() {
                return VDOM.createElement('button', null, 'Test Button');
            }
        });

        VDOM.render(VDOM.createElement(customButton), $('#test-container')[0]);

        expect($('#test-container').find('.custom-button').text()).to.equal('Test Button');
    });

    it("can nest down the Virtual DOM and reflect it onto the DOM", function() {
        var vdomTree = VDOM.createElement('div', {
            className : "start-tree"
        }, [
            "Tree Has Started",
            VDOM.createElement('br'),
            VDOM.createElement('div', null, "This is a Child"),
            VDOM.createElement('br'),
            VDOM.createElement('div', {
                className : 'child'
            }, VDOM.createElement('span', {
                className : 'child-of-child'
            }, "This is a Child span of a Div"))
        ]);

        VDOM.render(vdomTree, $('#test-container')[0]);

        expect($('#test-container')
                .children('.start-tree')
                .children('.child')
                .children('.child-of-child')
                .text()
        ).to.equal('This is a Child span of a Div');
    });

    it("keeps in track of the levels of the tree by using 'data-id' custom attribute, with root starting at level '.0'", function() {
        var testDiv = VDOM.createElement('div', null, "Hello World!");

        VDOM.render(testDiv, $('#test-container')[0]);

        expect(testDiv.attrs).to.have.property('data-id');
        expect($('#test-container').find('div').attr('data-id')).to.equal('.0');
    });

    it("will further down keep in track of the level of the DOM tree in data-id", function() {
        var customButtons = [1, 2, 3, 4 ,5].map(function(num) {
            return VDOM.createClass('customButton', {
                render : function() {
                    return VDOM.createElement('button', {
                        className : 'btn btn-primary'
                    }, VDOM.createElement('span', null, 'Test Button #' + num));
                }
            });
        }).map(function(component) {
            return VDOM.createElement(component);
        });

        var vdom = VDOM.createElement('ul', {
            className : 'button-container'
        }, customButtons);

        VDOM.render(vdom, $('#test-container')[0]);

        expect($('#test-container').find('[data-id=".0"]').hasClass('button-container')).to.be.true;
        expect($('#test-container').find('[data-id=".0.2"]').hasClass('btn-primary')).to.be.true;
        expect($('#test-container').find('[data-id=".0.3.0"]').text()).to.equal('Test Button #4');
    });
});

describe('VDOM\'s State Functionality', function() {
    beforeEach(function() {
        if ($('#test-container').length) {
            $('#test-container').html('');
        } else {
            $('body').prepend('<div id="test-container"></div>');
        }
    });

    it('rendering will attach click events to the DOM', function() {
        var clickCounter = 0;
        var vElem = VDOM.createElement('button', {
            onClick : function() {
                clickCounter++;
            }
        }, 'Click Me');

        VDOM.render(vElem, $('#test-container')[0]);
        $('[data-id=".0"]').trigger('click');

        expect(clickCounter).to.equal(1);
    });

    it('Can initialize and assign "state" of a component', function() {
        var buttonWidget = VDOM.createClass('customButton', {
            setState : function() {
                return {
                    count : 0
                };
            },
            render : function() {
                return VDOM.createElement('span', null, this.state.count);
            }
        });

        VDOM.render(VDOM.createElement(buttonWidget), $('#test-container')[0]);

        expect($('#test-container').find('.custom-button').text()).to.equal("0");
    });

    it('update actual DOM if there were any changes to the virtual DOM (click event)', function() {
        var buttonWidget = VDOM.createClass('customButton', {
            setState : function() {
                return {
                    count : 0
                };
            },
            tick : function() {
                this.state.count++;
            },
            render : function() {
                return VDOM.createElement('div', null, [
                        VDOM.createElement('button', {
                            onClick : this.tick
                        }, 'click me'),
                        VDOM.createElement('span', null, this.state.count)
                ]);
            }
        });

        var vButton = VDOM.createElement(buttonWidget);

        VDOM.render(vButton, $('#test-container')[0]);

        $('[data-id=".0.0"]').trigger('click');

        expect($('[data-id=".0.1"]').text()).to.equal('1');
    });

    it('update actual DOM if there were any changes to the virtual DOM (keyup event)', function() {
        var inputWidget = VDOM.createClass('customInput', {
            setState : function() {
                return {
                    input : ""
                };
            },
            render : function() {
                return VDOM.createElement('div', null,
                    [
                        VDOM.createElement('input', {
                            onKeyup : function(e) {
                                this.state.input = e.target.value;
                            }
                        }),
                        VDOM.createElement('span',null, this.state.input)
                    ]
                );
            }
        });

        VDOM.render(VDOM.createElement(inputWidget), $('#test-container')[0]);

        $('input').val('hello world');
        e = $.Event('keyup');
        e.keyCode= 13; // enter
        $('input').trigger(e);

        expect($('span').text()).to.equal('hello world');
    });
});
