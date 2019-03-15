import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import Graph2dRangeXTask from './Graph2dRangeXTask'

// TODO: move this into a factory
const task = {
  instruction: 'Mark an area of the graph that is interesting.',
  taskKey: 'T101',
  type: 'graph2dRangeX'
}

describe('Graph2dRangeXTask', function () {
  describe('when it renders', function () {
    let wrapper
    before(function () {
      wrapper = shallow(<Graph2dRangeXTask.wrappedComponent addAnnotation={() => {}} task={task} />)
    })

    it('should render without crashing', function () {
      expect(wrapper).to.be.ok
    })

    // TODO: component should be using our Markdownz
    it('should have instructions', function () {
      expect(wrapper.contains(task.instruction)).to.be.true
    })
  })
})
